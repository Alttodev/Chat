import {
  createContext,
  useCallback,
  useContext,
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
import axiosInstance from "@/api/axiosInstance";
import { Copy, PhoneOff } from "lucide-react";

const JitsiCallContext = createContext(null);

const JITSI_DOMAIN = "meet.jit.si";

const getJitsiToken = async (roomName, userName, userEmail) => {
  try {
    const response = await axiosInstance.get("/get-jitsi-token", {
      params: {
        roomName,
        name: userName,
        email: userEmail,
      },
    });
    return response.data.token;
  } catch (error) {
    console.error("Error fetching Jitsi token:", error);
    toastError("Failed to generate meeting token");
    return null;
  }
};

const createRoomName = (currentUserId, targetUserId) => {
  return `clix-${[currentUserId, targetUserId].map(String).sort().join("-")}`;
};

export const JitsiCallProvider = ({ children }) => {
  const userId = useAuthStore((state) => state.user?._id);
  const userName = useAuthStore((state) => state.user?.userName);
  const userEmail = useAuthStore((state) => state.user?.email);
  const [meeting, setMeeting] = useState(null);

  const closeCall = useCallback(() => {
    setMeeting(null);
  }, []);

  const startAudioCall = useCallback(
    async ({ targetUserId, targetUserName }) => {
      if (!userId || !targetUserId) {
        toastError("Call cannot be started");
        return null;
      }

      const roomName = createRoomName(userId, targetUserId);
      const token = await getJitsiToken(roomName, userName, userEmail);

      if (!token) {
        return null;
      }

      const inviteLink = `https://${JITSI_DOMAIN}/${encodeURIComponent(roomName)}`;

      setMeeting({
        roomName,
        token,
        inviteLink,
        targetUserName: targetUserName || "User",
      });

      return { roomName, inviteLink };
    },
    [userId, userName, userEmail],
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
                jwt={meeting.token}
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
