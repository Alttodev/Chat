import { useSocket } from "@/lib/socket";
import { useEffect, useState } from "react";

export const OnlineStatus = ({ userId, size }) => {
  const { socket } = useSocket();
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!socket || !userId) {
      setIsOnline(false);
      return;
    }

    const handleUserOnline = (id) => {
      if (id === userId) setIsOnline(true);
    };

    const handleUserOffline = (id) => {
      if (id === userId) setIsOnline(false);
    };

    const handleUserStatus = ({ id, online }) => {
      if (id === userId) setIsOnline(online);
    };

    // Ask server for this user's status
    socket.emit("check-user-status", userId);

    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);
    socket.on("user-status", handleUserStatus);

    return () => {
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
      socket.off("user-status", handleUserStatus);
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
