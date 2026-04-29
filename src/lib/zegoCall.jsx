import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import ZIM from "zego-zim-web";
import { toastError } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { getZegoToken } from "@/api/axios";

const ZegoCallContext = createContext(null);

export const ZegoCallProvider = ({ children }) => {
  const userId = useAuthStore((state) => state.user?._id);
  const userName = useAuthStore((state) => state.user?.userName);

  const zegoRef = useRef(null);
  const zimRef = useRef(null);
  const readyRef = useRef(false);
  const currentUserIdRef = useRef(null);
  const initInFlightRef = useRef(false);

  const appId = Number(import.meta.env.VITE_ZEGO_APP_ID);

  useEffect(() => {
    if (!userId) return;

    const init = async () => {
      if (initInFlightRef.current) return;
      if (currentUserIdRef.current === userId && readyRef.current) return;

      initInFlightRef.current = true;

      try {
        const authUserId = userId.toString();
        currentUserIdRef.current = authUserId;

        const tokenResponse = await getZegoToken();
        const serverToken = tokenResponse?.token ?? tokenResponse?.data?.token;
        const appIdFromServer = Number(
          tokenResponse?.appId ?? tokenResponse?.data?.appId,
        );

        const effectiveAppId = appId || appIdFromServer;

        if (!serverToken || !effectiveAppId) {
          throw new Error("Missing Zego config or token");
        }

        if (!zimRef.current) {
          zimRef.current = ZIM.create({ appID: effectiveAppId });
        }

        const zim = zimRef.current;

        try {
          await zim.logout();
        } catch {
          // Ignore logout errors if the session is already clean.
        }

        await zim.login(
          {
            userID: authUserId,
            userName: userName || "User",
          },
          serverToken,
        );

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          effectiveAppId,
          serverToken,
          "",
          authUserId,
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.addPlugins({ ZIM });

        zp.setCallInvitationConfig({
          onIncomingCallReceived: (callID, caller) => {
            const accept = window.confirm(
              `Incoming call from ${caller.userName}`,
            );

            if (accept) {
              zp.acceptCallInvitation(callID);
            } else {
              zp.rejectCallInvitation(callID);
            }
          },
        });

        zegoRef.current = zp;
        readyRef.current = true;
      } catch (error) {
        console.log("Zego init error:", error);
        toastError("Call service initialization failed");
        readyRef.current = false;
      } finally {
        initInFlightRef.current = false;
      }
    };

    init();
  }, [appId, userId, userName]);

  const startAudioCall = useCallback(
    async ({ targetUserId, targetUserName }) => {
      if (!targetUserId) return;

      if (!readyRef.current || !zegoRef.current) {
        toastError("Call service not ready");
        return;
      }

      console.log("Calling:", targetUserId);

      try {
        await zegoRef.current.sendCallInvitation({
          callees: [
            {
              userID: targetUserId.toString(),
              userName: targetUserName || "User",
            },
          ],
          callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
          timeout: 60,
        });
      } catch (error) {
        console.log("Call error:", error);

        if (error?.code === 6000281) {
          toastError("User is not available for calls");
        } else if (error?.code === 6000105) {
          toastError("User did not respond");
        } else {
          toastError("Call failed");
        }
      }
    },
    [],
  );

  return (
    <ZegoCallContext.Provider value={{ startAudioCall }}>
      {children}
    </ZegoCallContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useZegoCall = () => useContext(ZegoCallContext);
