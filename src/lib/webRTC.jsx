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
  const currentTargetUserRef = useRef(null);
  const ringtoneRef = useRef(null);
  const [activeCall, setActiveCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [callState, setCallState] = useState(CALL_STATES.IDLE);
  const [isMuted, setIsMuted] = useState(false);
  const pendingIceCandidates = useRef([]);
  const outgoingCallRef = useRef(null);

  const unlockAudio = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      ctx.resume();
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

    stopRingtone();

    setIncomingCall(null);
    setOutgoingCall(null);
    setActiveCall(null);

    setCallState(CALL_STATES.IDLE);
    setIsMuted(false);
  }, [stopRingtone]);

  // ---------------- LOCAL STREAM ----------------
  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStreamRef.current = stream;
    return stream;
  };

  // ---------------- PEER ----------------
  const createPeer = useCallback(
    (targetUserId) => {
      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.emit("call:ice-candidate", {
            targetUserId,
            candidate: event.candidate,
          });
        }
      };

      peer.ontrack = async (event) => {
        const stream = event.streams[0];

        if (!remoteAudioRef.current) {
          const audio = document.createElement("audio");
          audio.autoplay = true;
          audio.playsInline = true;
          audio.controls = false;
          document.body.appendChild(audio);
          remoteAudioRef.current = audio;
        }

        remoteAudioRef.current.srcObject = stream;

        try {
          await remoteAudioRef.current.play();
        } catch (err) {
          console.warn("Autoplay blocked:", err);
        }
      };

      peer.onconnectionstatechange = () => {
        if (peer.connectionState === "connected") {
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

      setOutgoingCall(callData);
      setActiveCall(callData);

      setCallState(CALL_STATES.CALLING);
    },
    [socket, user, createPeer],
  );

  // ---------------- ACCEPT CALL ----------------
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socket) return;
    unlockAudio();
    stopRingtone();

    currentTargetUserRef.current = incomingCall.callerId;

    const stream = await getLocalStream();
    const peer = createPeer(incomingCall.callerId);

    peerRef.current = peer;

    stream.getTracks().forEach((track) => {
      peer.addTrack(track, stream);
    });

    await peer.setRemoteDescription(
      new RTCSessionDescription(incomingCall.offer),
    );

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket.emit("call:answer", {
      callerId: incomingCall.callerId,
      answer,
    });
    setActiveCall(incomingCall);
    setIncomingCall(null);
    setCallState(CALL_STATES.IN_CALL);
  }, [incomingCall, socket, createPeer, stopRingtone]);

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
      });

      setCallState(CALL_STATES.RINGING);
      playRingtone();
    };

    const handleAnswer = async ({ answer }) => {
      if (!peerRef.current || peerRef.current.remoteDescription) return;

      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(answer),
      );

      setActiveCall({
        callerName: outgoingCallRef.current?.callerName,
        callerImage: outgoingCallRef.current?.callerImage,
        targetUserId: outgoingCallRef.current?.targetUserId,
      });

      setCallState(CALL_STATES.IN_CALL);
    };

    const handleIce = async ({ candidate }) => {
      if (!peerRef.current) return;

      if (!peerRef.current.remoteDescription) {
        pendingIceCandidates.current.push(candidate);
        return;
      }

      try {
        await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.error("ICE add error", err);
      }
    };
    const handleEnd = () => cleanupCall();

    const handleBusy = () => {
      setCallState(CALL_STATES.BUSY);
      cleanupCall();
    };

    const handleReject = () => {
      setCallState(CALL_STATES.REJECTED);
      cleanupCall();
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
  }, [socket, playRingtone, cleanupCall,outgoingCall]);

  return (
    <WebRTCContext.Provider
      value={{
        startAudioCall,
        acceptCall,
        rejectCall,
        endCall,

        incomingCall,
        outgoingCall,
        callState,
        activeCall,
        isMuted,
        toggleMute,
      }}
    >
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
