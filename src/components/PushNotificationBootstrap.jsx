import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import {
  listenForForegroundMessages,
  registerPushToken,
} from "@/lib/pushNotifications";

export function PushNotificationBootstrap() {
  const queryClient = useQueryClient();
  const authToken = useAuthStore((state) => state.token);
  const userId = useAuthStore((state) => state.user?._id);

  useEffect(() => {
    if (!authToken || !userId) return;

    let unsubscribe = () => {};
    let cancelled = false;

    const initPushNotifications = async () => {
      try {
        await registerPushToken(authToken);

        if (cancelled) return;

        unsubscribe = listenForForegroundMessages((payload) => {
          const title = payload?.notification?.title || "New notification";
          const body = payload?.notification?.body || "";

          toast(title, body ? { description: body } : undefined);

          queryClient.invalidateQueries({ queryKey: ["notification_counts"] });
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        });
      } catch (error) {
        console.error("Push notification setup failed:", error);
      }
    };

    initPushNotifications();

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [authToken, userId, queryClient]);

  return null;
}

export default PushNotificationBootstrap;
