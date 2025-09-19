import { useSocket } from "@/lib/socket";
import { useEffect, useState } from "react";

export const OnlineStatus = ({ userId, size }) => {
  const { socket } = useSocket();
  const [isOnline, setIsOnline] = useState(false);

 useEffect(() => {
  if (!socket) return;

  // Ask server for this user's status
  socket.emit("check-user-status", userId);

  socket.on("user-online", (id) => {
    if (id === userId) setIsOnline(true);
  });

  socket.on("user-offline", (id) => {
    if (id === userId) setIsOnline(false);
  });

  socket.on("user-status", ({ id, online }) => {
    if (id === userId) setIsOnline(online);
  });

  return () => {
    socket.off("user-online");
    socket.off("user-offline");
    socket.off("user-status");
  };
}, [socket, userId]);


  return (
    <div className="flex items-center gap-2">
      <span
        className={`${size} rounded-full ${
          isOnline ? "bg-green-500" : "bg-yellow-500"
        }`}
      ></span>
    </div>
  );
};
