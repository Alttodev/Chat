import { useEffect, useState } from "react";
import { useWebRTC } from "@/lib/webRTC";
import { RefreshCcw } from "lucide-react";

export default function VideoCallScreen({ onEnd }) {
  const {
    localVideoRef,
    remoteVideoRef,
    localStream,
    remoteStream,
    toggleCamera,
  } = useWebRTC();
  const [rotating, setRotating] = useState(false);

  const handleToggleCamera = async () => {
    setRotating(true);

    try {
      await toggleCamera();
    } finally {
      setTimeout(() => setRotating(false), 500);
    }
  };
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, localVideoRef]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, remoteVideoRef]);

  return (
    <div className="fixed inset-0 bg-black z-[9999]">
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="absolute top-4 right-4 w-32 h-44 rounded-lg border border-white"
      />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-row items-center gap-3">
        <button
          onClick={handleToggleCamera}
          className="w-12 h-12 flex items-center justify-center bg-emerald-600 text-white rounded-full cursor-pointer"
          title="Flip camera"
        >
          <RefreshCcw size={20} className={rotating ? "animate-spin" : ""} />
        </button>

        {/* End Call */}
        <button
          onClick={onEnd}
          className="bg-red-600 px-6 py-3 rounded-full cursor-pointer"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
