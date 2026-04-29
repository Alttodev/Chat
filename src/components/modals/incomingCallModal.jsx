import { Dialog, DialogContent } from "../ui/dialog";
import { Button } from "../ui/button";
import { Phone, PhoneOff } from "lucide-react";
import { useIncomingCallStore } from "@/lib/zustand";
import { useJitsiCall } from "@/lib/jitsiCall";
import { useSocket } from "@/lib/socket";
import { useAuthStore } from "@/store/authStore";

export function IncomingCallModal() {
  const { isOpen, incomingCall, closeIncomingCall } = useIncomingCallStore();
  const { startAudioCall } = useJitsiCall();
  const { socket } = useSocket();
  const userId = useAuthStore((state) => state.user?._id);

  const handleAccept = async () => {
    if (!incomingCall) return;

    // Notify caller that call was accepted
    socket?.emit("call:accepted", {
      callerId: incomingCall.callerId,
      receiverId: userId,
    });

    // Start the Jitsi call
    await startAudioCall({
      targetUserId: incomingCall.callerId,
      targetUserName: incomingCall.callerName,
    });

    closeIncomingCall();
  };

  const handleReject = () => {
    if (!incomingCall) return;

    // Notify caller that call was rejected
    socket?.emit("call:rejected", {
      callerId: incomingCall.callerId,
      receiverId: userId,
    });

    closeIncomingCall();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleReject()}>
      <DialogContent className="w-[calc(100%-1rem)] max-w-sm rounded-lg p-4 sm:rounded-xl [&_button]:cursor-pointer">
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-emerald-600">
              Incoming Call
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {incomingCall?.callerName || "Unknown"} is calling...
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleAccept}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <Phone className="h-4 w-4" />
              Accept
            </Button>
            <Button
              onClick={handleReject}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <PhoneOff className="h-4 w-4" />
              Reject
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
