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
  const isReadyRef = useRef(false);

  const appId = Number(import.meta.env.VITE_ZEGO_APP_ID);

  useEffect(() => {
    if (!user?._id) return;

    let isMounted = true;

    const initZego = async () => {
      try {
        const userId = user._id.toString();

        const res = await getZegoToken();
        const serverToken = res?.data?.token;
        const appIdFromServer = Number(res?.data?.appId);

        const effectiveAppId = appId || appIdFromServer;

        if (!serverToken || !effectiveAppId) {
          throw new Error("Missing Zego config");
        }

        // ✅ prevent multiple instances
        if (!zimRef.current) {
          zimRef.current = ZIM.create({ appID: effectiveAppId });
        }

        const zim = zimRef.current;

        // ✅ login
        await zim.login(
          {
            userID: userId,
            userName: user.userName,
          },
          serverToken
        );

        console.log("✅ ZIM login success:", userId);

        // ✅ create kit
        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          effectiveAppId,
          serverToken,
          "",
          userId
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zp.addPlugins({ ZIM });

        // ✅ incoming call handler
        zp.setCallInvitationConfig({
          onIncomingCallReceived: (callID, caller) => {
            console.log("📞 Incoming call:", caller);

            const accept = window.confirm(
              `Incoming call from ${caller.userName}`
            );

            if (accept) {
              zp.acceptCallInvitation(callID);
            } else {
              zp.rejectCallInvitation(callID);
            }
          },

          onIncomingCallTimeout: () => {
            console.log("⏰ Missed call");
          },
        });

        if (isMounted) {
          zegoRef.current = zp;
          isReadyRef.current = true;
        }
      } catch (error) {
        console.log("❌ Zego init error:", error);
        toastError("Failed to initialize call service");
      }
    };

    initZego();

    // ✅ cleanup
    return () => {
      isMounted = false;
      isReadyRef.current = false;
    };
  }, [appId, user._id, user.userName]);

  // ✅ START CALL (no unreliable online check)
  const startAudioCall = useCallback(async ({ targetUserId, targetUserName }) => {
    if (!targetUserId) return;

    if (!zegoRef.current || !isReadyRef.current) {
      toastError("Call service not ready");
      return;
    }

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

      console.log("📞 Calling:", targetUserId);
    } catch (error) {
      console.log("❌ Call error:", error);

      if (error?.code === 6000281) {
        toastError("User not online in call service");
      } else if (error?.code === 6000105) {
        toastError("User didn’t respond (timeout)");
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