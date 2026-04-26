import { createContext, useCallback, useContext, useEffect, useRef } from "react";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import ZIM from "zego-zim-web";
import { toastError } from "@/lib/toast";
import { useAuthStore } from "@/store/authStore";
import { getZegoToken } from "@/api/axios";

const ZegoCallContext = createContext(null);

export const ZegoCallProvider = ({ children }) => {
  const { user } = useAuthStore();

  const zegoRef = useRef(null);
  const zimRef = useRef(null);
  const readyRef = useRef(false);
  const currentUserIdRef = useRef(null);

  const appId = Number(import.meta.env.VITE_ZEGO_APP_ID);

  useEffect(() => {
    if (!user || !user._id) return;

    const init = async () => {
      try {
        const userId = user._id.toString();

        // 🔥 prevent re-init for same user
        if (currentUserIdRef.current === userId && readyRef.current) return;

        currentUserIdRef.current = userId;

        const res = await getZegoToken();
        const serverToken = res?.data?.token;
        const appIdFromServer = Number(res?.data?.appId);

        const effectiveAppId = appId || appIdFromServer;

        if (!serverToken || !effectiveAppId) {
          throw new Error("Missing Zego config");
        }

        // ✅ create ZIM once
        if (!zimRef.current) {
          zimRef.current = ZIM.create({ appID: effectiveAppId });
        }

        const zim = zimRef.current;

        // ✅ logout old session (important)
        try {
          await zim.logout();
        } catch {
          //ignore logout errors
        }

        // ✅ login with EXACT SAME ID
        await zim.login(
          {
            userID: userId,
            userName: user.userName || "User",
          },
          serverToken
        );

        console.log("✅ ZIM login success:", userId);

        // ✅ create UI kit
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          effectiveAppId,
          serverToken,
          "",
          userId
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.addPlugins({ ZIM });

        // ✅ handle incoming call (REQUIRED)
        zp.setCallInvitationConfig({
          onIncomingCallReceived: (callID, caller) => {
            console.log("📞 Incoming call from:", caller);

            const accept = window.confirm(
              `Incoming call from ${caller.userName}`
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
        console.log("❌ Zego init error:", error);
        toastError("Call service initialization failed");
        readyRef.current = false;
      }
    };

    init();
  }, [user?._id]);

  // ✅ START CALL
  const startAudioCall = useCallback(async ({ targetUserId, targetUserName }) => {
    if (!targetUserId) return;

    if (!readyRef.current || !zegoRef.current) {
      toastError("Call service not ready");
      return;
    }

    console.log("📞 Calling:", targetUserId);

    try {
      await zegoRef.current.sendCallInvitation({
        callees: [
          {
            userID: targetUserId.toString(), // MUST match receiver login ID
            userName: targetUserName || "User",
          },
        ],
        callType: ZegoUIKitPrebuilt.InvitationTypeVoiceCall,
        timeout: 60,
      });
    } catch (error) {
      console.log("❌ Call error:", error);

      if (error?.code === 6000281) {
        toastError("User is not available for calls");
      } else if (error?.code === 6000105) {
        toastError("User did not respond");
      } else {
        toastError("Call failed");
      }
    }
  }, []);

  return (
    <ZegoCallContext.Provider value={{ startAudioCall }}>
      {children}
    </ZegoCallContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useZegoCall = () => useContext(ZegoCallContext);