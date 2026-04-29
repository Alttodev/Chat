import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { JitsiMeeting } from "@jitsi/react-sdk";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toastError, toastSuccess } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/lib/socket";
import { useIncomingCallStore } from "@/lib/zustand";
import { IncomingCallModal } from "@/components/modals/incomingCallModal";
import { Copy, PhoneOff } from "lucide-react";

const JitsiCallContext = createContext(null);

const JITSI_DOMAIN = "meet.jit.si";

const createRoomName = (currentUserId, targetUserId) => {
  return `clix-${[currentUserId, targetUserId].map(String).sort().join("-")}`;
};

export const JitsiCallProvider = ({ children }) => {
  const userId = useAuthStore((state) => state.user?._id);
  const userName = useAuthStore((state) => state.user?.userName);
  const { socket } = useSocket();
  const { openIncomingCall } = useIncomingCallStore();
  const [meeting, setMeeting] = useState(null);

  const closeCall = useCallback(() => {
    setMeeting(null);
  }, []);

  // Listen for incoming calls
  useEffect(() => {
    if (!socket) return;

    socket.on("call:incoming", (data) => {
      openIncomingCall({
        callerId: data.callerId,
        callerName: data.callerName,
      });
      toastSuccess(`Incoming call from ${data.callerName}`);
    });

    socket.on("call:rejected", () => {
      closeCall();
      toastError("Call was rejected");
    });

    socket.on("call:missed", () => {
      closeCall();
      toastError("Call was missed");
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:rejected");
      socket.off("call:missed");
    };
  }, [socket, openIncomingCall, closeCall]);

  const startAudioCall = useCallback(
    async ({ targetUserId, targetUserName }) => {
      if (!userId || !targetUserId) {
        toastError("Call cannot be started");
        return null;
      }

      const roomName = createRoomName(userId, targetUserId);
      const inviteLink = `https://${JITSI_DOMAIN}/${encodeURIComponent(roomName)}`;

      // Emit socket event to notify the other user of incoming call
      socket?.emit("call:initiate", {
        callerId: userId,
        callerName: userName,
        receiverId: targetUserId,
        roomName,
      });

      setMeeting({
        roomName,
        inviteLink,
        targetUserName: targetUserName || "User",
      });

      return { roomName, inviteLink };
    },
    [userId, userName, socket],
  );

  const copyInviteLink = useCallback(async () => {
    if (!meeting?.inviteLink) return;

    try {
      await navigator.clipboard.writeText(meeting.inviteLink);
      toastSuccess("Invite link copied");
    } catch {
      toastError("Could not copy invite link");
    }
  }, [meeting]);

  const meetingUserInfo = useMemo(
    () => ({
      displayName: userName || "User",
    }),
    [userName],
  );

  return (
    <JitsiCallContext.Provider value={{ startAudioCall, closeCall }}>
      {children}

      <IncomingCallModal />

      <Dialog open={!!meeting} onOpenChange={(open) => !open && closeCall()}>
        <DialogContent className="w-[calc(100%-1rem)] max-w-6xl overflow-hidden p-0 [&_button]:cursor-pointer">
          <DialogHeader className="border-b px-4 py-3">
            <DialogTitle className="flex items-center justify-between gap-3">
              <div>
                <div className="text-base font-semibold text-emerald-600">
                  Call with {meeting?.targetUserName || "User"}
                </div>
                <div className="text-xs font-normal text-muted-foreground">
                  Room: {meeting?.roomName}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyInviteLink}
                  className="cursor-pointer"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={closeCall}
                  className="cursor-pointer"
                >
                  <PhoneOff className="mr-2 h-4 w-4" />
                  End
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {meeting && (
            <div className="h-[78vh] w-full">
              <JitsiMeeting
                domain={JITSI_DOMAIN}
                roomName={meeting.roomName}
                userInfo={meetingUserInfo}
                configOverwrite={{
                  prejoinPageEnabled: false,
                  startWithAudioMuted: false,
                  startWithVideoMuted: true,
                  disableDeepLinking: true,
                  enableWelcomePage: false,
                }}
                interfaceConfigOverwrite={{
                  DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                  MOBILE_APP_PROMO: false,
                }}
                onReadyToClose={closeCall}
                getIFrameRef={(iframe) => {
                  iframe.style.width = "100%";
                  iframe.style.height = "100%";
                  iframe.style.border = "0";
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </JitsiCallContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useJitsiCall = () => useContext(JitsiCallContext);
