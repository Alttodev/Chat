/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyANwOW-5vk_yvMWKLa15CUCHV346VGW8FQ",
  authDomain: "chat-app-bc969.firebaseapp.com",
  projectId: "chat-app-bc969",
  storageBucket: "chat-app-bc969.firebasestorage.app",
  messagingSenderId: "437527172776",
  appId: "1:437527172776:web:99934872ffed1ef123949d",
});


const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload?.notification?.title || "New notification";
  const options = {
    body: payload?.notification?.body || "",
    icon: "/vite.svg",
    data: payload?.data || {},
  };

  self.registration.showNotification(title, options);
});
