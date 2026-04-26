import { useCallback, useEffect, useMemo } from "react";
import { Bell, UserPlus, MessageCircle, BellOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { useSocket } from "../../lib/socket";
import {
  useNotificationCounts,
  useMarkNotificationSeen,
  useNotifications,
  useNotificationSettings,
} from "@/hooks/notificationHooks";

const formatTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return "";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};

const getInitial = (name) => {
  const value = name?.trim();
  return value ? value.charAt(0).toUpperCase() : "?";
};

function NotificationSection() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { data: countsData } = useNotificationCounts();
  const { data: notificationsData, isLoading, refetch } = useNotifications(30);
  const { data: notificationSettingsData } = useNotificationSettings();
  const { mutateAsync: markNotificationSeen } = useMarkNotificationSeen();

  const pushNotificationsEnabled =
    notificationSettingsData?.settings?.enabled ?? true;

  const totalCount = countsData?.counts?.total || 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notifications = notificationsData?.notifications || [];

  const followNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => notification?.type === "follow-request",
      ),
    [notifications],
  );

  const chatNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => notification?.type === "chat-message",
      ),
    [notifications],
  );

  const playNotificationSound = useCallback(() => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const audioContext = new AudioContextClass();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.08,
        audioContext.currentTime + 0.01,
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.2,
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
      oscillator.onended = () => {
        audioContext.close().catch(() => {});
      };
    } catch {
      // Ignore sound errors (autoplay/device restrictions).
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      if (!pushNotificationsEnabled) {
        playNotificationSound();
      }

      queryClient.invalidateQueries({ queryKey: ["notification_counts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("new-notification", handleNewNotification);

    return () => {
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket, queryClient, playNotificationSound, pushNotificationsEnabled]);

  const handleOpenChange = useCallback(
    (isOpen) => {
      if (!isOpen) return;
      queryClient.invalidateQueries({ queryKey: ["notification_counts"] });
      refetch();
    },
    [queryClient, refetch],
  );

  const handleNotificationClick = useCallback(
    async (notification) => {
      try {
        if (
          notification?.type === "follow-request" &&
          notification?.followRequestId
        ) {
          await markNotificationSeen({
            type: "follow-request",
            followRequestId: notification.followRequestId,
          });
        }

        if (
          notification?.type === "chat-message" &&
          notification?.conversationId
        ) {
          await markNotificationSeen({
            type: "chat-message",
            conversationId: notification.conversationId,
          });
        }
      } catch {
        // Navigation should still work even if marking seen fails.
      } finally {
        if (notification?.type === "follow-request") {
          navigate("/friends", { state: { tab: "requests" } });
          // eslint-disable-next-line no-unsafe-finally
          return;
        }

        if (notification?.type === "chat-message") {
          const targetId =
            notification?.from?._id || notification?.otherParticipantIds?.[0];
          const targetName = notification?.from?.userName || "User";

          if (targetId) {
            navigate(
              `/messages?userId=${targetId}&name=${encodeURIComponent(targetName)}`,
            );
          } else {
            navigate("/messages");
          }
        }
      }
    },
    [navigate, markNotificationSeen],
  );

  const badgeText = totalCount > 99 ? "99+" : totalCount;

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-primary hover:bg-accent/10 cursor-pointer relative"
        >
          {pushNotificationsEnabled ? (
            <Bell className="w-5 h-5 text-green-500" />
          ) : (
            <BellOff className="w-5 h-5" />
          )}

          {totalCount > 0 && pushNotificationsEnabled && (
            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {badgeText}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] p-0 ">
        <div className="p-4 border-b bg-muted/40">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
          <p className="text-xs text-muted-foreground">
            {totalCount > 0
              ? `${totalCount} unread updates`
              : "You're all caught up"}
          </p>
        </div>

        <ScrollArea className="max-h-[420px]">
          <div className="p-2">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No new notifications
              </div>
            ) : (
              <>
                {followNotifications.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Follow Requests
                    </p>
                    {followNotifications.map((notification) => (
                      <button
                        key={notification.notificationId}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full flex items-start gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors  cursor-pointer text-left"
                      >
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {getInitial(notification?.from?.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            <span className="font-semibold">
                              {notification?.from?.userName || "Someone"}
                            </span>{" "}
                            sent you a follow request
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification?.createdAt)}
                          </p>
                        </div>
                        <UserPlus className="w-4 h-4 text-emerald-600 mt-1" />
                      </button>
                    ))}
                  </div>
                )}

                {followNotifications.length > 0 &&
                  chatNotifications.length > 0 && <DropdownMenuSeparator />}

                {chatNotifications.length > 0 && (
                  <div className="mt-2">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Messages
                    </p>
                    {chatNotifications.map((notification) => (
                      <button
                        key={notification.notificationId}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className="w-full flex items-start gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors  cursor-pointer text-left"
                      >
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="bg-blue-100 text-blue-700">
                            {getInitial(notification?.from?.userName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            <span className="font-semibold">
                              {notification?.from?.userName || "Unknown user"}
                            </span>{" "}
                            sent {notification?.unreadCount || 1} message
                            {(notification?.unreadCount || 1) > 1 ? "s" : ""}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {notification?.message?.text || "Image message"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(notification?.createdAt)}
                          </p>
                        </div>
                        <MessageCircle className="w-4 h-4 text-green-500 mt-1 " />
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default NotificationSection;
