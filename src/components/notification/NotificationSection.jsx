import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  UserPlus,
  MessageCircle,
  BellOff,
  MessageCircleMore,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
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
  playNotificationSound,
  primeNotificationSound,
} from "@/lib/notificationSound";
import { useAuthStore } from "@/store/authStore";
import {
  useNotificationCounts,
  useMarkNotificationRead,
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
  const { profileId } = useAuthStore();
  const { data: countsData } = useNotificationCounts();
  const { data: notificationsData, isLoading, refetch } = useNotifications(30);
  const { data: notificationSettingsData } = useNotificationSettings();
  const { mutateAsync: markNotificationRead } = useMarkNotificationRead();

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

  const commentMentionNotifications = useMemo(
    () =>
      notifications.filter(
        (notification) => notification?.type === "comment-mention",
      ),
    [notifications],
  );

  const [gameInvites, setGameInvites] = useState([]);

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

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = () => {
      if (pushNotificationsEnabled) {
        playNotificationSound();
      }

      queryClient.invalidateQueries({ queryKey: ["notification_counts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("new-notification", handleNewNotification);

    // handle live rock-paper-scissors invites
    const handleRpsInvite = (invite) => {
      try {
        setGameInvites((s) => {
          // avoid duplicates by roomId
          if (s.find((i) => i.roomId === invite.roomId)) return s;
          return [invite, ...s];
        });

        if (pushNotificationsEnabled) playNotificationSound();
        queryClient.invalidateQueries({ queryKey: ["notification_counts"] });
      } catch (err) {
        console.log("Failed to handle incoming game invite", err);
        // ignore
      }
    };

    socket.on("game:rps:invite", handleRpsInvite);

    return () => {
      socket.off("new-notification", handleNewNotification);
      socket.off("game:rps:invite", handleRpsInvite);
    };
  }, [socket, queryClient, pushNotificationsEnabled]);

  const handleOpenChange = useCallback(
    (isOpen) => {
      if (!isOpen) return;
      primeNotificationSound();
      queryClient.invalidateQueries({ queryKey: ["notification_counts"] });
      refetch();
    },
    [queryClient, refetch],
  );

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

  const handleClearAllNotifications = useCallback(async () => {
    if (!notifications.length) return;

    try {
      await Promise.all(
        notifications.map(async (notification) => {
          try {
            await markAsSeen(notification);
          } catch (error) {
            console.error("Failed to mark notification seen:", error);
          }
        }),
      );

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notification_counts"] });
      refetch();
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }, [notifications, markAsSeen, queryClient, refetch]);

  const respondToInvite = useCallback(
    (invite, accepted) => {
      if (!socket) return;

      try {
        socket.emit("game:rps:response", {
          roomId: invite.roomId,
          fromUserId: invite.fromUserId,
          toUserId: invite.toUserId,
          accepted,
        });

        setGameInvites((s) => s.filter((i) => i.roomId !== invite.roomId));

        if (accepted) {
          // accepted - notify user
          // navigation or opening the game can be handled here if desired
          // for now, show success
          // eslint-disable-next-line no-unused-expressions
          typeof window !== "undefined" && window.scrollTo(0, 0);
        }
      } catch (e) {
        console.error("Failed to respond to invite", e);
      }
    },
    [socket],
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

      <DropdownMenuContent
        align="center"
        sideOffset={8}
        className="w-[calc(100vw-1rem)] max-w-[360px] p-0 sm:w-[360px]"
      >
        <div className="p-4 border-b bg-muted/40 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Notifications
            </p>
            <p className="text-xs text-muted-foreground">
              {totalCount > 0
                ? `${totalCount} unread updates`
                : "You're all caught up"}
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="h-8 px-3 flex items-center gap-2  dark:hover:bg-red-900/20 cursor-pointer"
            onClick={handleClearAllNotifications}
            disabled={notifications.length === 0}
          >
            <span className="text-sm font-medium">Clear all</span>
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
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Follow Requests
                    </p>

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

                        <UserPlus className="w-4 h-4 text-emerald-600 mt-1" />
                      </button>
                    ))}
                  </div>
                )}

                {gameInvites.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Game Invites
                    </p>

                    {gameInvites.map((invite) => (
                      <div
                        key={invite.roomId}
                        className="w-full flex items-start gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                      >
                        <Avatar className="w-9 h-9">
                          <AvatarImage
                            className="w-full h-full object-cover object-top cursor-pointer"
                            src={invite?.fromProfileImage || "/placeholder.svg"}
                          />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700">
                            {getInitial(invite?.fromUserName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground leading-snug">
                            <span className="font-semibold">
                              {invite?.fromUserName || "Someone"}
                            </span>{" "}
                            invited you to play Rock-Paper-Scissors
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTime(invite?.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => respondToInvite(invite, false)}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => respondToInvite(invite, true)}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {followNotifications.length > 0 &&
                  (chatNotifications.length > 0 ||
                    commentMentionNotifications.length > 0) && (
                    <DropdownMenuSeparator />
                  )}

                {chatNotifications.length > 0 && (
                  <div className="mt-2">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Messages
                    </p>

                    {chatNotifications.map((notification) => (
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

                        <MessageCircle className="w-4 h-4 text-green-500 mt-1" />
                      </button>
                    ))}
                  </div>
                )}

                {chatNotifications.length > 0 &&
                  commentMentionNotifications.length > 0 && (
                    <DropdownMenuSeparator />
                  )}

                {commentMentionNotifications.length > 0 && (
                  <div className="mt-2">
                    <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Comment Mentions
                    </p>

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

                        <MessageCircleMore className="w-4 h-4 text-green-500 mt-1" />
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
