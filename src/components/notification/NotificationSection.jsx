import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";
import { useSocket } from "../../lib/socket";

function NotificationSection() {
  const { socket } = useSocket();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    socket.on("new-notification", () => {
      setCount((prev) => prev + 1);
    });

    return () => {
      socket.off("new-notification");
    };
  }, [socket]);

  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-primary hover:bg-accent/10 cursor-pointer relative"
      >
        <Bell className="w-5 h-5" />

        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {count}
          </span>
        )}
      </Button>
    </div>
  );
}

export default NotificationSection;
