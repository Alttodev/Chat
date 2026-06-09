import { Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWebRTC } from "@/lib/webRTC";

export default function IncomingCallPopup({ name }) {
  const { incomingCall, acceptCall, rejectCall } = useWebRTC();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="w-80 rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-center">
          Incoming Audio Call
        </h2>

        <p className="mt-2 text-center text-gray-500">
          {name} is calling...
        </p>

        <div className="mt-6 flex justify-center gap-4">
          <Button variant="destructive" size="icon" onClick={rejectCall} className="cursor-pointer">
            <PhoneOff />
          </Button>

          <Button
            size="icon"
            className="bg-green-600 hover:bg-green-700 cursor-pointer"
            onClick={acceptCall}
          >
            <Phone />
          </Button>
        </div>
      </div>
    </div>
  );
}
