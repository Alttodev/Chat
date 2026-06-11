import { useEffect } from "react";
import { useWebRTC } from "@/lib/webRTC";

export default function VideoCallScreen({ onEnd }) {
  const { localVideoRef, remoteVideoRef, remoteStream } = useWebRTC();

  useEffect(() => {
    const video = remoteVideoRef.current;

    if (!video || !remoteStream) return;

    if (video.srcObject !== remoteStream) {
      video.srcObject = remoteStream;
    }

    video.onloadedmetadata = () => {
      video.play().catch(() => {});
    };
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
        className="absolute top-4 right-4 w-32 h-44 rounded-lg border"
      />

      <button
        onClick={onEnd}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-red-600 px-6 py-3 rounded-full cursor-pointer"
      >
        End Call
      </button>
    </div>
  );
}
