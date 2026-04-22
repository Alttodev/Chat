import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import ZIM from "zego-zim-web";
import { toastError } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { getZegoToken } from "@/api/axios";

const ZegoCallContext = createContext(null);

export const ZegoCallProvider = ({ children }) => {
  const { user, token } = useAuthStore();
  const zegoRef = useRef(null);
  const initializedUserIdRef = useRef(null);
  const isInitializingRef = useRef(false);
  const initErrorRef = useRef("");

  const appId = Number(import.meta.env.VITE_ZEGO_APP_ID);

  const initZego = useCallback(async () => {
    const userId = user?._id?.toString();
    if (!userId || !token) return false;
    if (initializedUserIdRef.current === userId && zegoRef.current) return true;
    if (isInitializingRef.current) return false;

    isInitializingRef.current = true;
    initErrorRef.current = "";

    try {
      const tokenRes = await getZegoToken();
      const token = tokenRes?.data?.token;
      const appIdFromServer = Number(tokenRes?.data?.appId);
      const userIdFromServer = tokenRes?.data?.userId?.toString();
      const effectiveAppId = appId || appIdFromServer;
      const effectiveUserId = userIdFromServer || userId;

      if (!token || !effectiveAppId || !effectiveUserId) {
        throw new Error("Missing ZEGO token/appId/userId from server");
      }

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        effectiveAppId,
        token,
        "",
        effectiveUserId
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zp.addPlugins({ ZIM });

      zegoRef.current = zp;
      initializedUserIdRef.current = userId;
      return true;
    } catch (error) {
      zegoRef.current = null;
      initializedUserIdRef.current = null;
      initErrorRef.current =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to initialize call service";
      return false;
    } finally {
      isInitializingRef.current = false;
    }
  }, [appId, user?._id, token]);

  useEffect(() => {
    initZego();
  }, [initZego]);

  const startAudioCall = useCallback(
    async ({ targetUserId, targetUserName }) => {
      if (!targetUserId) return;

      let zegoInstance = zegoRef.current;
      if (!zegoInstance) {
        const ready = await initZego();
        zegoInstance = zegoRef.current;
        if (!ready || !zegoInstance) {
          toastError(initErrorRef.current || "Audio call is not ready yet");
          return;
        }
      }

      try {
        await zegoInstance.sendCallInvitation({
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
        const code = error?.code;
        if (code === 6000281) {
          toastError(
            "User is not online in call service yet. Ask them to open the app and try again."
          );
          return;
        }
        if (code === 6000105) {
          toastError("Call request timed out. Please try again.");
          return;
        }
        throw error;
      }
    },
    [initZego]
  );

  return (
    <ZegoCallContext.Provider value={{ startAudioCall }}>
      {children}
    </ZegoCallContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useZegoCall = () => useContext(ZegoCallContext);
