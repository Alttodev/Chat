import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { useSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

const WebRTCContext = createContext(null);

const CALL_STATES = {
  IDLE: "idle",
  CALLING: "calling",
  RINGING: "ringing",
  IN_CALL: "in_call",
  BUSY: "busy",
  ENDED: "ended",
  REJECTED: "rejected",
};

export const WebRTCProvider = ({ children }) => {
  const { socket } = useSocket();
  const { user } = useAuthStore();

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const currentTargetUserRef = useRef(null);
  const ringtoneRef = useRef(null);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [callState, setCallState] = useState(CALL_STATES.IDLE);
  const [isMuted, setIsMuted] = useState(false);
  const pendingIceCandidates = useRef([]);
  const outgoingCallRef = useRef(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [remoteStream, setRemoteStream] = useState(null);

  const wakeLockRef = useRef(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const requestWakeLock = async () => {
    try {
      if ("wakeLock" in navigator && !wakeLockRef.current) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");

        wakeLockRef.current.addEventListener("release", () => {
          console.log("Wake Lock released");
        });
      }
    } catch (e) {
      console.log("Wake lock failed", e);
    }
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const releaseWakeLock = async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    } catch (e) {
      console.log(e);
    }
  };
  const unlockAudio = async () => {
    try {
      const audio = new Audio();
      audio.muted = true;
      await audio.play();
      audio.pause();
    } catch (e) {
      console.warn("Audio unlock failed", e);
    }
  };

  // ---------------- MUTE ----------------
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;

    const track = stream.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  }, []);

  // ---------------- RINGTONE ----------------
  const playRingtone = useCallback(() => {
    if (!ringtoneRef.current) {
      ringtoneRef.current = new Audio("/ringtone.mp3");
      ringtoneRef.current.loop = true;
    }
    ringtoneRef.current.play().catch(() => {});
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, []);

  // ---------------- CLEANUP ----------------
  const cleanupCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.pause();
      remoteAudioRef.current.srcObject = null;
    }
    setIsVideoCall(false);
    stopRingtone();
    releaseWakeLock();
    setIncomingCall(null);
    setOutgoingCall(null);
    setActiveCall(null);

    setCallState(CALL_STATES.IDLE);
    setIsMuted(false);
  }, [releaseWakeLock, stopRingtone]);

  // ---------------- LOCAL STREAM ----------------
  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStreamRef.current = stream;
    return stream;
  };

  const flushIce = async (peer) => {
    if (!peer.remoteDescription) return;

    for (const candidate of pendingIceCandidates.current) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("ICE flush error:", e);
      }
    }

    pendingIceCandidates.current = [];
  };

  // ---------------- PEER ----------------
  const createPeer = useCallback(
    (targetUserId) => {
      const peer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      });

      peer.onsignalingstatechange = () => {
        if (peer.signalingState === "stable") {
          flushIce(peer);
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("call:ice-candidate", {
            targetUserId,
            candidate: event.candidate,
          });
        }
      };

      peer.ontrack = (event) => {
        const stream = event.streams[0];

        console.log("REMOTE STREAM:", stream);

        setRemoteStream(stream);

        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = stream;

          remoteAudioRef.current.play().catch(() => {});
        }
      };
      peer.onconnectionstatechange = async () => {
        if (peer.connectionState === "connected") {
          await requestWakeLock();
          setCallState(CALL_STATES.IN_CALL);
          stopRingtone();
        }

        if (
          peer.connectionState === "failed" ||
          peer.connectionState === "disconnected"
        ) {
          cleanupCall();
        }
      };

      return peer;
    },
    [socket, stopRingtone, cleanupCall],
  );

  // ---------------- START CALL ----------------
  const startAudioCall = useCallback(
    async ({ targetUserId, targetUserName, targetUserProfileImage }) => {
      if (!socket || !user) return;
      unlockAudio();
      await requestWakeLock();

      currentTargetUserRef.current = targetUserId;

      const stream = await getLocalStream();
      const peer = createPeer(targetUserId);

      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call:offer", {
        receiverId: targetUserId,
        offer,
      });

      const callData = {
        callerName: targetUserName,
        callerImage: targetUserProfileImage,
        targetUserId,
      };
      setIsVideoCall(false);
      setOutgoingCall(callData);
      setActiveCall(callData);

      setCallState(CALL_STATES.CALLING);
    },
    [socket, user, requestWakeLock, createPeer],
  );

  const startVideoCall = useCallback(
    async ({ targetUserId, targetUserName, targetUserProfileImage }) => {
      if (!socket || !user) return;

      unlockAudio();
      await requestWakeLock();

      currentTargetUserRef.current = targetUserId;

      // VIDEO + AUDIO
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });

      localStreamRef.current = stream;

      // Show local camera
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log(
        "LOCAL TRACKS:",
        stream.getTracks().map((t) => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState,
        })),
      );

      const peer = createPeer(targetUserId);
      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call:offer", {
        receiverId: targetUserId,
        offer,
        callType: "video", // important
      });

      const callData = {
        callerName: targetUserName,
        callerImage: targetUserProfileImage,
        targetUserId,
      };
      setIsVideoCall(true);
      setOutgoingCall(callData);
      setActiveCall(callData);
      setCallState(CALL_STATES.CALLING);
    },
    [socket, user, requestWakeLock, createPeer],
  );

  // ---------------- ACCEPT CALL ----------------
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socket) return;

    unlockAudio();
    stopRingtone();
    await requestWakeLock();

    currentTargetUserRef.current = incomingCall.callerId;

    let stream;

    if (incomingCall.callType === "video") {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      localStreamRef.current = stream;
    } else {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    }

    console.log(
      "LOCAL TRACKS:",
      stream.getTracks().map((t) => ({
        kind: t.kind,
        enabled: t.enabled,
        readyState: t.readyState,
      })),
    );

    localStreamRef.current = stream;

    const peer = createPeer(incomingCall.callerId);

    peerRef.current = peer;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    await peer.setRemoteDescription(
      new RTCSessionDescription(incomingCall.offer),
    );

    await flushIce(peer);

    const answer = await peer.createAnswer();

    await peer.setLocalDescription(answer);

    socket.emit("call:answer", {
      callerId: incomingCall.callerId,
      answer,
    });

    setActiveCall(incomingCall);
    setIncomingCall(null);
    setCallState(CALL_STATES.IN_CALL);
  }, [incomingCall, socket, createPeer, stopRingtone, requestWakeLock]);

  // ---------------- REJECT CALL ----------------
  const rejectCall = useCallback(() => {
    if (!incomingCall || !socket) return;

    socket.emit("call:reject", {
      callerId: incomingCall.callerId,
    });

    cleanupCall();
    setCallState(CALL_STATES.REJECTED);
  }, [incomingCall, socket, cleanupCall]);

  // ---------------- END CALL ----------------
  const endCall = useCallback(() => {
    socket?.emit("call:end", {
      targetUserId: currentTargetUserRef.current,
    });

    cleanupCall();
    setCallState(CALL_STATES.ENDED);
  }, [socket, cleanupCall]);

  // ---------------- SOCKET EVENTS ----------------

  useEffect(() => {
    if (!socket) return;

    outgoingCallRef.current = outgoingCall;

    const handleOffer = (data) => {
      setIncomingCall({
        callerId: data.callerId,
        callerName: data.callerName,
        callerImage: data.callerImage,
        offer: data.offer,
        callType: data.callType,
      });
      setIsVideoCall(data.callType === "video");
      setCallState(CALL_STATES.RINGING);
      playRingtone();
    };

    const handleAnswer = async ({ answer }) => {
      if (!peerRef.current || peerRef.current.remoteDescription) return;

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
      await flushIce(peerRef.current);
      // 🔥 ADD THIS FIX
      for (const candidate of pendingIceCandidates.current) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.warn("Pending ICE error:", e);
        }
      }

      pendingIceCandidates.current = [];

      setActiveCall({
        callerName: outgoingCallRef.current?.callerName,
        callerImage: outgoingCallRef.current?.callerImage,
        targetUserId: outgoingCallRef.current?.targetUserId,
      });

      setCallState(CALL_STATES.IN_CALL);
    };
    const handleIce = async ({ candidate }) => {
      if (!peerRef.current) return;

      try {
        if (peerRef.current.remoteDescription) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          pendingIceCandidates.current.push(candidate);
        }
      } catch (err) {
        console.error("ICE error:", err);
      }
    };

    const handleEnd = () => cleanupCall();

    const handleBusy = () => {
      setCallState(CALL_STATES.BUSY);
      cleanupCall();
    };

    const handleReject = () => {
      cleanupCall();
      setCallState(CALL_STATES.REJECTED);

      setOutgoingCall(null); // 🔥 important
      setActiveCall(null);
    };

    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:ice-candidate", handleIce);
    socket.on("call:end", handleEnd);
    socket.on("call:reject", handleReject);
    socket.on("call:busy", handleBusy);

    return () => {
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      socket.off("call:ice-candidate", handleIce);
      socket.off("call:end", handleEnd);
      socket.off("call:reject", handleReject);
      socket.off("call:busy", handleBusy);
    };
  }, [socket, playRingtone, cleanupCall, outgoingCall]);

  return (
    <WebRTCContext.Provider
      value={{
        startAudioCall,
        startVideoCall,
        acceptCall,
        rejectCall,
        isVideoCall,
        endCall,
        remoteStream,
        localVideoRef,
        localStreamRef,
        remoteVideoRef,
        incomingCall,
        outgoingCall,
        callState,
        activeCall,
        isMuted,
        toggleMute,
      }}
    >
      <audio ref={remoteAudioRef} autoPlay playsInline />

      {children}
    </WebRTCContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWebRTC = () => {
  const ctx = useContext(WebRTCContext);
  if (!ctx) throw new Error("useWebRTC must be used inside provider");
  return ctx;
};
