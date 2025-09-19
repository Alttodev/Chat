import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const API_URL = import.meta.env.VITE_APP_API_URL;

  const storedData = JSON.parse(localStorage.getItem("chat-storage") || "{}");
  const userId = storedData?.state?.user?._id;

  const connectSocket = (userId) => {
    if (!userId) return;
    if (socket) return;

    const newSocket = io(API_URL, { query: { userId } });
    setSocket(newSocket);

    return newSocket;
  };

  const disconnectSocket = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    localStorage.removeItem("chat-storage");
  };

  useEffect(() => {
    if (!userId) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    if (socket) return;
    const newSocket = io(API_URL, { query: { userId } });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  return (
    <SocketContext.Provider value={{ socket, disconnectSocket, connectSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => useContext(SocketContext);
