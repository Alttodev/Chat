import { getApps, initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyANwOW-5vk_yvMWKLa15CUCHV346VGW8FQ",
  authDomain: "chat-app-bc969.firebaseapp.com",
  projectId: "chat-app-bc969",
  storageBucket: "chat-app-bc969.firebasestorage.app",
  messagingSenderId: "437527172776",
  appId: "1:437527172776:web:99934872ffed1ef123949d",
  measurementId: "G-VDMGVJK3PR",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const messaging = getMessaging(app);
