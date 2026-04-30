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
import { toastError } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/lib/socket";
import { useIncomingCallStore } from "@/lib/zustand";
import { IncomingCallModal } from "@/components/modals/incomingCallModal";
import { PhoneOff } from "lucide-react";

const JitsiCallContext = createContext(null);

const JITSI_DOMAIN = "meet.jit.si";

const createRoomName = (currentUserId, targetUserId) => {
  return `clix-${[currentUserId, targetUserId].map(String).sort().join("-")}`;
};

export const JitsiCallProvider = ({ children }) => {
  const userId = useAuthStore((state) => state.user?._id);
  const user = useAuthStore((state) => state.user);

  const { socket } = useSocket();
  const { openIncomingCall } = useIncomingCallStore();
  const [meeting, setMeeting] = useState(null);
  const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const closeCall = useCallback(() => {
    setMeeting(null);
  }, []);

  // Listen for socket events
  useEffect(() => {
    if (!socket) return;
    socket.on("call:incoming", (data) => {
      console.log("📞 Incoming call data:", data);
      openIncomingCall(data); // show modal
    });

    socket.on("call:accepted", ({ roomName, fromUserName }) => {
      if (isMobile()) {
        window.open(`https://${JITSI_DOMAIN}/${roomName}`, "_blank");
        return;
      }

      setTimeout(() => {
        setMeeting({
          roomName,
          targetUserName: fromUserName,
        });
      }, 1500);
    });

    socket.on("call:rejected", () => {
      toastError("Call rejected");
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
    };
  }, [socket, openIncomingCall]);

  const startAudioCall = useCallback(
    ({ targetUserId }) => {
      if (!socket || !socket.connected) return;

      const roomName = createRoomName(userId, targetUserId);

      socket.emit("call:initiate", {
        callerId: userId,
        callerName: user?.userName || "User",
        receiverId: targetUserId,
        roomName,
      });

      if (isMobile()) {
        window.open(`https://${JITSI_DOMAIN}/${roomName}`, "_blank");
        return;
      }

      // DESKTOP → open inside app
      setMeeting({
        roomName,
        targetUserName: "Calling...",
      });
    },
    [userId, user, socket],
  );
  
 const meetingUserInfo = useMemo(
  () => ({
    displayName: user?.userName || "User",
  }),
  [user],
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
                  enableUserRolesBasedOnToken: false,
                  enableLobby: false,
                  disableModeratorIndicator: true,
                  enableNoAudioDetection: false,
                  enableNoisyMicDetection: false,
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
