import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebRTC } from "@/lib/webRTC";

export default function IncomingCallPopup() {
  const { incomingCall, acceptCall, rejectCall } = useWebRTC();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      
      <div className="w-100 rounded-xl border border-gray-700 bg-white dark:bg-gray-900 p-6 shadow-2xl">
        
        <h2 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
          Incoming Audio Call
        </h2>

        <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
          {incomingCall?.callerName || "Unknown"} is calling...
        </p>

        <div className="mt-6 flex justify-center gap-6">
          
          {/* REJECT */}
          <Button
            variant="destructive"
            size="icon"
            onClick={rejectCall}
            className="cursor-pointer rounded-full w-12 h-12"
          >
            <PhoneOff />
          </Button>

          {/* ACCEPT */}
          <Button
            size="icon"
            onClick={acceptCall}
            className="cursor-pointer rounded-full w-12 h-12 bg-green-600 hover:bg-green-700"
          >
            <Phone />
          </Button>

        </div>
      </div>
    </div>
  );
}