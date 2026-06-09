import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import { useSocket } from "@/lib/socket";

const WebRTCContext = createContext(null);

export const WebRTCProvider = ({ children }) => {
  const { socket } = useSocket();

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const currentTargetUserRef = useRef(null);

  const [incomingCall, setIncomingCall] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  const cleanupCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setIncomingCall(null);
    setIsCalling(false);
  }, []);

  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStreamRef.current = stream;

    return stream;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const createPeer = useCallback((targetUserId) => {
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.l.google.com:19302",
        },
      ],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        console.log("ICE SENT");

        socket.emit("call:ice-candidate", {
          targetUserId,
          candidate: event.candidate,
        });
      }
    };

    peer.ontrack = (event) => {
      console.log("REMOTE AUDIO RECEIVED");

      const remoteStream = event.streams[0];

      if (!remoteAudioRef.current) {
        const audio = document.createElement("audio");
        audio.autoplay = true;
        remoteAudioRef.current = audio;
      }

      remoteAudioRef.current.srcObject = remoteStream;
    };

    peer.onconnectionstatechange = () => {
      console.log(
        "CONNECTION STATE:",
        peer.connectionState,
      );
    };

    return peer;
  });

  /**
   * START CALL
   */
  const startAudioCall = useCallback(
    async ({ targetUserId }) => {
      try {
        console.log("START CALL");
        console.log("TARGET:", targetUserId);

        if (!socket) {
          console.log("SOCKET NOT READY");
          return;
        }

        currentTargetUserRef.current = targetUserId;

        const stream = await getLocalStream();

        const peer = createPeer(targetUserId);

        peerRef.current = peer;

        stream.getTracks().forEach((track) => {
          peer.addTrack(track, stream);
        });

        const offer = await peer.createOffer();

        await peer.setLocalDescription(offer);

        console.log("OFFER SENT");

        socket.emit("call:offer", {
          receiverId: targetUserId,
          offer,
        });

        setIsCalling(true);
      } catch (err) {
        console.error("START CALL ERROR");
        console.error(err);
      }
    },
    [createPeer, socket],
  );

  /**
   * ACCEPT CALL
   */
  const acceptCall = useCallback(async () => {
    try {
      if (!incomingCall || !socket) return;

      console.log("ACCEPTING CALL");

      currentTargetUserRef.current =
        incomingCall.callerId;

      const stream = await getLocalStream();

      const peer = createPeer(
        incomingCall.callerId,
      );

      peerRef.current = peer;

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      await peer.setRemoteDescription(
        new RTCSessionDescription(
          incomingCall.offer,
        ),
      );

      const answer = await peer.createAnswer();

      await peer.setLocalDescription(answer);

      console.log("ANSWER SENT");

      socket.emit("call:answer", {
        callerId: incomingCall.callerId,
        answer,
      });

      setIncomingCall(null);
      setIsCalling(true);
    } catch (err) {
      console.error("ACCEPT ERROR");
      console.error(err);
    }
  }, [createPeer, incomingCall, socket]);

  /**
   * REJECT CALL
   */
  const rejectCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  /**
   * END CALL
   */
  const endCall = useCallback(() => {
    socket?.emit("call:end", {
      targetUserId: currentTargetUserRef.current,
    });

    cleanupCall();
  }, [socket, cleanupCall]);

  /**
   * SOCKET EVENTS
   */
  useEffect(() => {
    if (!socket) return;

    const handleOffer = ({
      callerId,
      offer,
    }) => {
      console.log("INCOMING CALL");

      setIncomingCall({
        callerId,
        offer,
      });
    };

    const handleAnswer = async ({
      answer,
    }) => {
      try {
        console.log("ANSWER RECEIVED");

        if (!peerRef.current) return;

        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer),
        );

        console.log("CALL CONNECTED");
      } catch (err) {
        console.error(err);
      }
    };

    const handleIceCandidate = async ({
      candidate,
    }) => {
      try {
        if (!peerRef.current) return;

        await peerRef.current.addIceCandidate(
          new RTCIceCandidate(candidate),
        );

        console.log("ICE RECEIVED");
      } catch (err) {
        console.error("ICE ERROR");
        console.error(err);
      }
    };

    const handleEnd = () => {
      console.log("CALL ENDED");
      cleanupCall();
    };

    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on(
      "call:ice-candidate",
      handleIceCandidate,
    );
    socket.on("call:end", handleEnd);

    return () => {
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      socket.off(
        "call:ice-candidate",
        handleIceCandidate,
      );
      socket.off("call:end", handleEnd);
    };
  }, [socket, cleanupCall]);

  return (
    <WebRTCContext.Provider
      value={{
        startAudioCall,
        acceptCall,
        rejectCall,
        endCall,
        incomingCall,
        isCalling,
      }}
    >
      {children}
    </WebRTCContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useWebRTC = () => {
  const context = useContext(WebRTCContext);

  if (!context) {
    throw new Error(
      "useWebRTC must be used inside WebRTCProvider",
    );
  }

  return context;
};