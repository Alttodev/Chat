import { useWebRTC } from "@/lib/webRTC";
import React, { useEffect, useState } from "react";

export default function CallScreen({ name, image, onEnd }) {
  const { isMuted, toggleMute } = useWebRTC();
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-black text-white flex flex-col z-50">
      {/* TOP SECTION */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-3xl font-bold">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{name?.charAt(0)}</span>
          )}
        </div>

        <h2 className="mt-4 text-xl font-semibold">{name}</h2>

        <p className="text-green-400 mt-2">{format(time)}</p>

        <div className="text-gray-400 mt-3 animate-pulse">Connected</div>
      </div>

      {/* CONTROLS (BOTTOM FIXED AREA) */}
      <div className="pb-8 pt-4 flex justify-center">
        <div className="flex items-center gap-6">
          {/* MUTE */}
          <button
            onClick={toggleMute}
            className={`w-14 h-14 rounded-full flex items-center justify-center text-xl cursor-pointer ${
              isMuted ? "bg-red-600" : "bg-gray-700"
            }`}
          >
            {isMuted ? "🔇" : "🔊"}
          </button>

          {/* END CALL */}
          <button
            onClick={onEnd}
            className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-xl cursor-pointer"
          >
            📞
          </button>
        </div>
      </div>
    </div>
  );
}
