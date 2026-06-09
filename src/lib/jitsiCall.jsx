import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import Peer from "simple-peer";
import { useSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

const WebRTCContext = createContext(null);

export const WebRTCProvider = ({ children }) => {
  const { socket } = useSocket();

  const user = useAuthStore((state) => state.user);
  const userId = user?._id;

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  const cleanupCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());

      localStreamRef.current = null;
    }

    setIsCalling(false);
    setIncomingCall(null);
  }, []);

  const createLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    localStreamRef.current = stream;

    return stream;
  };

  /**
   * START CALL
   */
  const startAudioCall = useCallback(
    async ({ targetUserId }) => {
      if (!socket || !targetUserId) return;

      const stream = await createLocalStream();

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream,
        config: {
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302",
            },
          ],
        },
      });

      peerRef.current = peer;

      peer.on("signal", (signalData) => {
        socket.emit("call:offer", {
          callerId: userId,
          receiverId: targetUserId,
          callerName: user?.userName,
          signalData,
        });
      });

      peer.on("stream", (remoteStream) => {
        if (!remoteAudioRef.current) {
          const audio = new Audio();
          audio.autoplay = true;
          remoteAudioRef.current = audio;
        }

        remoteAudioRef.current.srcObject = remoteStream;
      });

      peer.on("close", cleanupCall);

      peer.on("error", (err) => {
        console.error(err);
        cleanupCall();
      });

      setIsCalling(true);
    },
    [socket, userId, user, cleanupCall],
  );

  /**
   * ACCEPT CALL
   */
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socket) return;

    const stream = await createLocalStream();

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          {
            urls: "stun:stun.l.google.com:19302",
          },
        ],
      },
    });

    peerRef.current = peer;

    peer.signal(incomingCall.signalData);

    peer.on("signal", (answerSignal) => {
      socket.emit("call:answer", {
        callerId: incomingCall.callerId,
        receiverId: userId,
        answerSignal,
      });
    });

    peer.on("stream", (remoteStream) => {
      if (!remoteAudioRef.current) {
        const audio = new Audio();
        audio.autoplay = true;
        remoteAudioRef.current = audio;
      }

      remoteAudioRef.current.srcObject = remoteStream;
    });

    peer.on("close", cleanupCall);

    peer.on("error", (err) => {
      console.error(err);
      cleanupCall();
    });

    setIncomingCall(null);
    setIsCalling(true);
  }, [incomingCall, socket, userId, cleanupCall]);

  /**
   * REJECT CALL
   */
  const rejectCall = useCallback(() => {
    if (!socket || !incomingCall) return;

    socket.emit("call:reject", {
      callerId: incomingCall.callerId,
    });

    setIncomingCall(null);
  }, [socket, incomingCall]);

  /**
   * END CALL
   */
  const endCall = useCallback(() => {
    if (!socket) return;

    socket.emit("call:end");

    cleanupCall();
  }, [socket, cleanupCall]);

  /**
   * SOCKET LISTENERS
   */
  useEffect(() => {
    if (!socket) return;

    const handleOffer = (payload) => {
      setIncomingCall(payload);
    };

    const handleAnswer = ({ answerSignal }) => {
      peerRef.current?.signal(answerSignal);
    };

    const handleRejected = () => {
      cleanupCall();
      alert("Call rejected");
    };

    const handleEnded = () => {
      cleanupCall();
      alert("Call ended");
    };

    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:rejected", handleRejected);
    socket.on("call:ended", handleEnded);

    return () => {
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
      socket.off("call:rejected", handleRejected);
      socket.off("call:ended", handleEnded);
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
    throw new Error("useWebRTC must be used inside WebRTCProvider");
  }

  return context;
};
