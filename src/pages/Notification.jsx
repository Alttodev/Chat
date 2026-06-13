import { useCallback, useEffect, useMemo } from "react";
import {
  UserPlus,
  MessageCircleMore,
  Send,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { primeNotificationSound } from "@/lib/notificationSound";
import { useAuthStore } from "@/store/authStore";
import {
  useMarkNotificationRead,
  useNotifications,
  useClearNotifications,
} from "@/hooks/notificationHooks";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

function NotificationPage() {
  const navigate = useNavigate();
  const { profileId } = useAuthStore();
  const { data: notificationsData, isLoading } = useNotifications(30);
  const { mutateAsync: markNotificationRead } = useMarkNotificationRead();
  const { mutate: clearNotifications, isPending } = useClearNotifications();

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

  const commentMentionNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => notification?.type === "comment-mention",
      ),
    [notifications],
  );

  useEffect(() => {
    const handleUnlock = () => {
      primeNotificationSound();
    };

    window.addEventListener("pointerdown", handleUnlock, { once: true });
    window.addEventListener("keydown", handleUnlock, { once: true });

    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, []);

  const markAsSeen = useCallback(
    async (notification) => {
      const notificationId = notification?.notificationId || notification?._id;
      if (!notificationId) return;

      await markNotificationRead(notificationId);
    },
    [markNotificationRead],
  );

  const handleNotificationClick = useCallback(
    async (notification) => {
      let targetPath = null;

      if (notification?.type === "follow-request") {
        targetPath = "/friends";
      } else if (notification?.type === "chat-message") {
        const targetId =
          notification?.from?._id || notification?.otherParticipantIds?.[0];
        const targetName = notification?.from?.userName || "User";

        targetPath = targetId
          ? `/messages?userId=${targetId}&name=${encodeURIComponent(targetName)}`
          : "/messages";
      } else if (notification?.type === "comment-mention") {
        const postOwnerId =
          notification?.post?.user?._id || notification?.post?.user;

        targetPath = postOwnerId
          ? postOwnerId?.toString?.() === profileId?.toString?.()
            ? `/profile?postId=${notification?.postId}&commentId=${notification?.commentId}`
            : `/users/${postOwnerId}?postId=${notification?.postId}&commentId=${notification?.commentId}`
          : `/home?postId=${notification?.postId}&commentId=${notification?.commentId}`;
      }

      try {
        await markAsSeen(notification);
      } catch {
        // Navigation should still work even if marking seen fails.
      }

      if (!targetPath) return;

      if (notification?.type === "follow-request") {
        navigate("/friends", { state: { tab: "requests" } });
        return;
      }

      navigate(targetPath);
    },
    [navigate, markAsSeen, profileId],
  );

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-background">
      <div className="px-2 py-1 bg-background  flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="cursor-pointer"
          onClick={() => clearNotifications()}
          disabled={isPending || notifications.length === 0}
        >
          {isPending ? "Clearing..." : "Clear All"}
        </Button>
      </div>

      <ScrollArea className="h-[220px]">
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
                  <div className="flex items-start gap-2 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Follow Requests</span>
                    <UserPlus className="w-3 h-3 " />
                  </div>

                  {followNotifications.map((notification) => (
                    <button
                      key={notification.notificationId || notification._id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full flex items-start gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer text-left"
                    >
                      <Avatar className="w-9 h-9">
                        <AvatarImage
                          className="w-full h-full object-cover object-top cursor-pointer"
                          src={
                            notification?.from?.profileImage ||
                            "/placeholder.svg"
                          }
                        />
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
                    </button>
                  ))}
                </div>
              )}

              {chatNotifications.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-start gap-2 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Messages</span>
                    <Send className="w-3 h-3 " />
                  </div>

                  {chatNotifications.map((notification) => (
                    <button
                      key={notification.notificationId || notification._id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full flex items-center justify-center gap-3 px-3 py-4 rounded-md hover:bg-accent transition-colors cursor-pointer text-left"
                    >
                      <Avatar className="w-9 h-9">
                        <AvatarImage
                          className="w-full h-full object-cover object-top cursor-pointer"
                          src={
                            notification?.from?.profileImage ||
                            "/placeholder.svg"
                          }
                        />
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
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification?.createdAt)}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {commentMentionNotifications.length > 0 && (
                <div className="mt-2">
                  <div className="flex items-start gap-2 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <span>Comment Mentions</span>
                    <MessageCircleMore className="w-3 h-3 " />
                  </div>

                  {commentMentionNotifications.map((notification) => (
                    <button
                      key={notification.notificationId || notification._id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className="w-full flex items-start gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer text-left"
                    >
                      <Avatar className="w-9 h-9">
                        <AvatarImage
                          className="w-full h-full object-cover object-top cursor-pointer"
                          src={
                            notification?.from?.profileImage ||
                            "/placeholder.svg"
                          }
                        />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                          {getInitial(notification?.from?.userName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-snug">
                          <span className="font-semibold">
                            {notification?.from?.userName || "Someone"}
                          </span>{" "}
                          mentioned you in a comment
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {notification?.comment || notification?.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(notification?.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default NotificationPage;
