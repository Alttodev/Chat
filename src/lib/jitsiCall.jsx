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

const WebRTCContext = createContext(null);

export const WebRTCProvider = ({ children }) => {
  const { socket } = useSocket();

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const [incomingCall, setIncomingCall] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  const cleanupCall = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
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

  const playRemoteStream = (remoteStream) => {
    if (!remoteAudioRef.current) {
      const audio = document.createElement("audio");
      audio.autoplay = true;
      remoteAudioRef.current = audio;
    }

    remoteAudioRef.current.srcObject = remoteStream;
  };

  /**
   * START CALL
   */
  const startAudioCall = useCallback(
    async ({ targetUserId }) => {
      if (!socket) return;

      console.log("START CALL");
      console.log("socket:", socket);
      console.log("targetUserId:", targetUserId);

      const stream = await getLocalStream();

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

      peer.on("signal", (offer) => {
         console.log("GENERATED OFFER", offer);
        socket.emit("call:offer", {
          receiverId: targetUserId,
          offer,
        });
      });

      peer.on("stream", playRemoteStream);

      peer.on("close", cleanupCall);

      peer.on("error", (err) => {
        console.error(err);
        cleanupCall();
      });

      setIsCalling(true);
    },
    [socket, cleanupCall],
  );

  /**
   * ACCEPT CALL
   */
  const acceptCall = useCallback(async () => {
    if (!incomingCall || !socket) return;

    const stream = await getLocalStream();

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

    peer.on("signal", (answer) => {
      socket.emit("call:answer", {
        callerId: incomingCall.callerId,
        answer,
      });
    });

    peer.on("stream", playRemoteStream);

    peer.on("close", cleanupCall);

    peer.on("error", (err) => {
      console.error(err);
      cleanupCall();
    });

    peer.signal(incomingCall.offer);

    setIncomingCall(null);
    setIsCalling(true);
  }, [incomingCall, socket, cleanupCall]);

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
    cleanupCall();

    socket?.emit("call:end", {});
  }, [socket, cleanupCall]);

  /**
   * SOCKET EVENTS
   */
  useEffect(() => {
    if (!socket) return;

    const handleOffer = ({ callerId, offer }) => {
      setIncomingCall({
        callerId,
        offer,
      });
    };

    const handleAnswer = ({ answer }) => {
      peerRef.current?.signal(answer);
    };

    const handleEnd = () => {
      cleanupCall();
    };

    socket.on("call:offer", handleOffer);
    socket.on("call:answer", handleAnswer);
    socket.on("call:end", handleEnd);

    return () => {
      socket.off("call:offer", handleOffer);
      socket.off("call:answer", handleAnswer);
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
    throw new Error("useWebRTC must be used inside WebRTCProvider");
  }

  return context;
};
