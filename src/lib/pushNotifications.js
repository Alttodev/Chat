import { getToken, onMessage } from "firebase/messaging";
import axiosInstance from "@/api/axiosInstance";
import { messaging } from "./firebase";

const PUSH_TOKEN_ENDPOINT = "/profile/push-tokens";
const FIREBASE_SW_PATH = "/firebase-messaging-sw.js";

const registrationState = {
  authToken: null,
  promise: null,
};

export const registerPushToken = async (authToken) => {
  if (!authToken) return null;
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return null;
  }

  if (registrationState.authToken === authToken && registrationState.promise) {
    return registrationState.promise;
  }

  registrationState.authToken = authToken;
  registrationState.promise = (async () => {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const swRegistration =
      await navigator.serviceWorker.register(FIREBASE_SW_PATH);

    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    if (!vapidKey) {
      throw new Error("VITE_FIREBASE_VAPID_KEY is missing");
    }

    const token = await getToken(messaging, {
      vapidKey,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) return null;

    await axiosInstance.post(
      PUSH_TOKEN_ENDPOINT,
      {
        token,
        deviceName: navigator.userAgent,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    return token;
  })();

  return registrationState.promise;
};

export const listenForForegroundMessages = (callback) => {
  return onMessage(messaging, callback);
};
