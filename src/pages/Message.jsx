import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ContactsSidebar from "@/components/Message/ContactsSidebar";
import MessagesList from "@/components/Message/MessagesList";
import MessageInput from "@/components/Message/MessageInput";
import ChatHeader from "@/components/Message/ChatHeader";
import ForwardMessageSheet from "@/components/Message/ForwardMessageSheet";
import {
  useBlockChatUser,
  useChatConversations,
  useDeleteChatMessage,
  useChatMessages,
  useMarkConversationSeen,
  useSendChatMessage,
  useUnblockChatUser,
} from "@/hooks/chatHooks";
import { useFriendsList } from "@/hooks/postHooks";
import { useAuthStore } from "@/store/authStore";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { toastError, toastSuccess } from "@/lib/toast";
import { useSocket } from "@/lib/socket";
import { useWebRTC } from "@/lib/jitsiCall";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
// import { useUserProfiles } from "@/hooks/authHooks";
import {
  getMessageMediaMimeType,
  getMessageMediaUrl,
  isAudioMediaUrl,
  isVideoMediaUrl,
} from "@/lib/media";
import { useUserProfiles } from "@/hooks/authHooks";

const getLastMessagePreview = (message) => {
  if (!message) return "";

  const text = message?.text?.trim();
  const mediaUrl = getMessageMediaUrl(message);
  const mediaType = getMessageMediaMimeType(message);
  const isAudio = !!message?.audio || isAudioMediaUrl(mediaUrl, mediaType);
  const isVideo = isVideoMediaUrl(mediaUrl, mediaType);

  if (text) return text;
  if (isAudio) return "Audio message";
  if (isVideo) return "Video message";
  if (mediaUrl) return "Image";

  return "";
};

export default function Message() {
  const BLOCKED_USERS_STORAGE_KEY = "chat-blocked-users";
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { startAudioCall } = useWebRTC();
  const { profileId } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState(() => {
    try {
      const raw = localStorage.getItem(BLOCKED_USERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  // const [isCalling, setIsCalling] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const typingStopTimeoutRef = useRef(null);
  const typingResetTimeoutRef = useRef(null);
  const loadMoreRef = useRef(null);
  const targetUserIdFromUrl = searchParams.get("userId");
  const targetUserNameFromUrl = searchParams.get("name");

  const { data: conversationData, isLoading: conversationsLoading } =
    useChatConversations();
  const {
    data,
    isLoading: friendsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFriendsList();
  const { mutateAsync: sendMessage, isPending: isSending } =
    useSendChatMessage();
  const { mutateAsync: markSeen } = useMarkConversationSeen();
  const { mutateAsync: deleteMessage } = useDeleteChatMessage();
  const { mutateAsync: blockUser, isPending: isBlockingUser } =
    useBlockChatUser();
  const { mutateAsync: unblockUser, isPending: isUnblockingUser } =
    useUnblockChatUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const conversations = conversationData?.conversations || [];

  const { data: profile } = useUserProfiles();
  const profileData = useMemo(() => profile, [profile]);

  const friendsData = useMemo(() => {
    return data?.pages?.flatMap((page) => page?.friends || []) || [];
  }, [data]);

  const getUserCallId = useCallback((userObj) => {
    if (!userObj) return "";

    return (
      // userObj?._id?.toString?.() ||
      userObj?.userId?.toString?.() ||
      userObj?.authUserId?.toString?.() ||
      userObj?.accountId?.toString?.() ||
      ""
    );
  }, []);

  const contacts = useMemo(() => {
    const acceptedFriends = friendsData.filter(
      (item) => item?.isFriends === true,
    );
    const acceptedFriendIds = new Set(
      acceptedFriends
        .map((item) =>
          item?.from?._id?.toString() === profileId?.toString()
            ? item?.to?._id
            : item?.from?._id,
        )
        .filter(Boolean)
        .map((id) => id.toString()),
    );

    const conversationContacts = conversations
      .map((conversation) => ({
        id: conversation?._id,
        conversationId: conversation?._id,
        targetUserId: conversation?.otherParticipant?._id,
        callUserId: getUserCallId(conversation?.otherParticipant),
        name: conversation?.otherParticipant?.userName || "Unknown",
        profileImage: conversation?.otherParticipant?.profileImage || "",
        avatar: "",
        isOnline: !!conversation?.otherParticipant?.isOnline,
        isBlocked:
          !!conversation?.blockedByMe ||
          !!conversation?.isBlocked ||
          !!conversation?.block?.isBlocked ||
          !!conversation?.otherParticipant?.isBlockedByCurrentUser ||
          !!blockedUsers[conversation?.otherParticipant?._id],
        blockedByMe:
          !!conversation?.blockedByMe ||
          !!blockedUsers[conversation?.otherParticipant?._id],
        lastSeen: conversation?.otherParticipant?.lastSeen || "",
        unreadCount: conversation?.unreadCount || 0,
        lastMessageAt: conversation?.lastMessageAt || conversation?.updatedAt,
        lastMessageText: getLastMessagePreview(conversation?.lastMessage),
        isFriend: acceptedFriendIds.has(
          conversation?.otherParticipant?._id?.toString(),
        ),
      }))
      .filter(
        (contact) =>
          contact?.targetUserId &&
          contact?.targetUserId?.toString() !== profileId?.toString() &&
          contact?.isFriend,
      )
      .sort((a, b) => {
        const aTime = a?.lastMessageAt
          ? new Date(a.lastMessageAt).getTime()
          : 0;
        const bTime = b?.lastMessageAt
          ? new Date(b.lastMessageAt).getTime()
          : 0;
        return bTime - aTime;
      });

    const extraFriendContacts = acceptedFriends
      .map((item) => {
        const friendUser =
          item?.from?._id?.toString() === profileId?.toString()
            ? item?.to
            : item?.from;
        if (!friendUser?._id) return null;
        return {
          id: `friend-${friendUser._id}`,
          conversationId: null,
          targetUserId: friendUser._id,
          callUserId: getUserCallId(friendUser),
          name: friendUser?.userName || "Unknown",
          ProfileImage: friendUser?.profileImage || "",
          avatar: "",
          isOnline: !!friendUser?.isOnline,
          isBlocked: !!blockedUsers[friendUser?._id],
          blockedByMe: !!blockedUsers[friendUser?._id],
          lastSeen: friendUser?.lastSeen || "",
          unreadCount: 0,
          lastMessageAt: null,
          lastMessageText: "",
          isFriend: true,
        };
      })
      .filter(Boolean)
      .filter(
        (friend) =>
          !conversationContacts.some(
            (contact) =>
              contact?.targetUserId?.toString() ===
              friend?.targetUserId?.toString(),
          ),
      );

    return [...conversationContacts, ...extraFriendContacts];
  }, [conversations, blockedUsers, profileId, friendsData, getUserCallId]);

  useEffect(() => {
    localStorage.setItem(
      BLOCKED_USERS_STORAGE_KEY,
      JSON.stringify(blockedUsers || {}),
    );
  }, [blockedUsers]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const contactsWithTarget = useMemo(() => {
    if (!targetUserIdFromUrl || targetUserIdFromUrl === profileId) {
      return contacts;
    }

    const exists = contacts.some(
      (item) => item?.targetUserId?.toString() === targetUserIdFromUrl,
    );

    if (exists) return contacts;

    const friendRows = friendsData?.friends || [];
    const acceptedIds = new Set(
      friendRows
        .filter((item) => item?.isFriends === true)
        .map((item) =>
          item?.from?._id?.toString() === profileId?.toString()
            ? item?.to?._id
            : item?.from?._id,
        )
        .filter(Boolean)
        .map((id) => id.toString()),
    );

    if (friendsData && !acceptedIds.has(targetUserIdFromUrl)) {
      return contacts;
    }

    const matchedFriendRow = friendRows.find((item) => {
      const friendUser =
        item?.from?._id?.toString() === profileId?.toString()
          ? item?.to
          : item?.from;

      return friendUser?._id?.toString() === targetUserIdFromUrl;
    });

    const matchedFriendUser =
      matchedFriendRow?.from?._id?.toString() === profileId?.toString()
        ? matchedFriendRow?.to
        : matchedFriendRow?.from;

    return [
      {
        id: targetUserIdFromUrl,
        conversationId: null,
        targetUserId: targetUserIdFromUrl,
        callUserId: getUserCallId(matchedFriendUser),
        name: targetUserNameFromUrl || "User",
        avatar: "",
        isOnline: false,
        isBlocked: !!blockedUsers[targetUserIdFromUrl],
        lastSeen: "",
        unreadCount: 0,
        lastMessageText: "",
        isFriend: true,
      },
      ...contacts,
    ];
  }, [
    targetUserIdFromUrl,
    profileId,
    contacts,
    friendsData,
    getUserCallId,
    targetUserNameFromUrl,
    blockedUsers,
  ]);

  const forwardableContacts = useMemo(() => {
    return contactsWithTarget.filter(
      (contact) => contact?.targetUserId?.toString() !== profileId?.toString(),
    );
  }, [contactsWithTarget, profileId]);

  useEffect(() => {
    if (!contactsWithTarget.length) return;

    if (targetUserIdFromUrl) {
      const matched = contactsWithTarget.find(
        (item) => item?.targetUserId?.toString() === targetUserIdFromUrl,
      );

      if (matched) {
        setSelectedContact((prev) => {
          const currentTargetId = prev?.targetUserId?.toString();
          const nextTargetId = matched?.targetUserId?.toString();

          if (currentTargetId === nextTargetId) {
            return prev;
          }

          return matched;
        });

        setShowChat(true);

        // clear params after selecting user
        setSearchParams({});
      }

      return;
    }

    if (!selectedContact) {
      setSelectedContact((prev) => prev || contactsWithTarget[0]);
    }
  }, [
    contactsWithTarget,
    selectedContact,
    targetUserIdFromUrl,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!selectedContact?.targetUserId || selectedContact?.conversationId)
      return;

    const matched = contacts.find(
      (item) =>
        item?.targetUserId?.toString() ===
        selectedContact?.targetUserId?.toString(),
    );

    if (matched) {
      setSelectedContact((prev) => {
        const prevTargetId = prev?.targetUserId?.toString();
        const nextTargetId = matched?.targetUserId?.toString();
        const prevConversationId = prev?.conversationId?.toString?.() || null;
        const nextConversationId =
          matched?.conversationId?.toString?.() || null;

        if (
          prevTargetId === nextTargetId &&
          prevConversationId === nextConversationId
        ) {
          return prev;
        }

        return matched;
      });
    }
  }, [
    contacts,
    selectedContact?.targetUserId,
    selectedContact?.conversationId,
  ]);

  useEffect(() => {
    setNewMessage("");
    setSelectedImage(null);
    setReplyToMessage(null);
    setForwardingMessage(null);
    setIsOtherTyping(false);
    if (typingStopTimeoutRef.current) {
      window.clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }
    if (typingResetTimeoutRef.current) {
      window.clearTimeout(typingResetTimeoutRef.current);
      typingResetTimeoutRef.current = null;
    }
  }, [selectedContact?.targetUserId]);

  const selectedConversationId = useMemo(() => {
    if (selectedContact?.conversationId) {
      return selectedContact.conversationId;
    }

    if (!selectedContact?.targetUserId) return null;

    const matchedConversation = conversations.find(
      (conversation) =>
        conversation?.otherParticipant?._id?.toString() ===
        selectedContact?.targetUserId?.toString(),
    );

    return matchedConversation?._id || null;
  }, [selectedContact, conversations]);

  // const { data: messageData, isLoading: messagesLoading } = useChatMessages(
  //   selectedConversationId,
  //   {
  //     enabled: !!selectedConversationId,
  //   },
  // );

  const {
    data: messageData,
    isLoading: messagesLoading,
    fetchNextPage: messageFetchNextPage,
    hasNextPage: messageHasNextPage,
    isFetchingNextPage: messageIsFetchingNextPage,
  } = useChatMessages(selectedConversationId);

  const messages = useMemo(() => {
    return (
      messageData?.pages
        ?.flatMap((page) => page.messages)
        ?.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) || []
    );
  }, [messageData]);

  const messageLoadMoreRef = useRef(null);

  useEffect(() => {
    if (!messageLoadMoreRef.current || !messageHasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !messageIsFetchingNextPage) {
          messageFetchNextPage();
        }
      },
      {
        threshold: 0.1,
      },
    );

    observer.observe(messageLoadMoreRef.current);

    return () => observer.disconnect();
  }, [messageFetchNextPage, messageHasNextPage, messageIsFetchingNextPage]);

  const clearUnreadCount = useCallback(
    (conversationId) => {
      if (!conversationId) return;

      queryClient.setQueryData(["chat_conversations"], (oldData) => {
        const conversationsList = Array.isArray(oldData?.conversations)
          ? oldData.conversations
          : [];

        if (!conversationsList.length) return oldData;

        return {
          ...oldData,
          conversations: conversationsList.map((conversation) =>
            conversation?._id?.toString() === conversationId?.toString()
              ? { ...conversation, unreadCount: 0 }
              : conversation,
          ),
        };
      });
    },
    [queryClient],
  );

  const refreshNotificationQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["notification_counts"] });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  useEffect(() => {
    if (!socket || !selectedConversationId || !selectedContact?.targetUserId) {
      return undefined;
    }

    const emitTyping = (isTyping) => {
      socket.emit("chat:typing", {
        conversationId: selectedConversationId,
        fromUserId: profileId,
        toUserId: selectedContact.targetUserId,
        isTyping,
      });
    };

    const hasTypingContent = !!newMessage.trim() || !!selectedImage;

    if (typingStopTimeoutRef.current) {
      window.clearTimeout(typingStopTimeoutRef.current);
      typingStopTimeoutRef.current = null;
    }

    emitTyping(hasTypingContent);

    if (hasTypingContent) {
      typingStopTimeoutRef.current = window.setTimeout(() => {
        emitTyping(false);
      }, 1200);
    }

    return () => {
      if (typingStopTimeoutRef.current) {
        window.clearTimeout(typingStopTimeoutRef.current);
        typingStopTimeoutRef.current = null;
      }
    };
  }, [
    newMessage,
    selectedImage,
    selectedConversationId,
    selectedContact?.targetUserId,
    socket,
    profileId,
  ]);

  useEffect(() => {
    if (!socket || !selectedConversationId || !selectedContact?.targetUserId) {
      return undefined;
    }

    return () => {
      socket.emit("chat:typing", {
        conversationId: selectedConversationId,
        fromUserId: profileId,
        toUserId: selectedContact.targetUserId,
        isTyping: false,
      });
    };
  }, [
    socket,
    selectedConversationId,
    selectedContact?.targetUserId,
    profileId,
  ]);

  useEffect(() => {
    if (!selectedConversationId) return;
    clearUnreadCount(selectedConversationId);
    markSeen(selectedConversationId)
      .then(() => {
        refreshNotificationQueries();
      })
      .catch(() => {});
  }, [
    selectedConversationId,
    markSeen,
    clearUnreadCount,
    refreshNotificationQueries,
  ]);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (payload = {}) => {
      const conversationId =
        payload?.conversationId || payload?.conversation?._id;
      const fromUserId = payload?.fromUserId || payload?.userId;
      const isTyping = !!payload?.isTyping;

      if (
        !selectedConversationId ||
        conversationId?.toString() !== selectedConversationId?.toString()
      ) {
        return;
      }

      if (fromUserId?.toString() === profileId?.toString()) return;

      setIsOtherTyping(isTyping);

      if (typingResetTimeoutRef.current) {
        window.clearTimeout(typingResetTimeoutRef.current);
      }

      if (isTyping) {
        typingResetTimeoutRef.current = window.setTimeout(() => {
          setIsOtherTyping(false);
        }, 3000);
      }
    };

    socket.on("chat:typing", handleTyping);

    return () => {
      socket.off("chat:typing", handleTyping);
    };
  }, [socket, selectedConversationId, profileId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload = {}) => {
      const conversationId =
        payload?.conversationId || payload?.conversation?._id;
      const message =
        payload?.message || payload?.chatMessage || payload?.data?.message;

      if (!conversationId || !message?._id) {
        queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
        return;
      }

      queryClient.setQueryData(["chat_messages", conversationId], (oldData) => {
        const currentMessages = Array.isArray(oldData?.messages)
          ? oldData.messages
          : Array.isArray(oldData?.chatMessages)
            ? oldData.chatMessages
            : Array.isArray(oldData?.data?.messages)
              ? oldData.data.messages
              : [];

        if (!currentMessages.length) {
          return {
            ...(oldData || {}),
            messages: [message],
          };
        }

        const exists = currentMessages.some(
          (item) => item?._id === message?._id,
        );
        if (exists) return oldData;

        return {
          ...oldData,
          messages: [...currentMessages, message],
        };
      });

      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });

      if (conversationId === selectedConversationId) {
        clearUnreadCount(conversationId);
        markSeen(conversationId)
          .then(() => {
            refreshNotificationQueries();
          })
          .catch(() => {});
      }
    };

    const handleMessageSeen = ({ conversationId, seenBy }) => {
      if (seenBy?.toString() === profileId?.toString()) return;

      queryClient.setQueryData(["chat_messages", conversationId], (oldData) => {
        if (!oldData?.messages) return oldData;

        return {
          ...oldData,
          messages: oldData.messages.map((msg) => {
            if (msg?.sender?._id?.toString() !== profileId?.toString()) {
              return msg;
            }

            const currentSeen = Array.isArray(msg?.seenBy) ? msg.seenBy : [];
            const hasSeen = currentSeen.some(
              (id) => id?.toString() === seenBy?.toString(),
            );

            if (hasSeen) return msg;

            return { ...msg, seenBy: [...currentSeen, seenBy] };
          }),
        };
      });
    };

    socket.on("chat:message:new", handleNewMessage);
    socket.on("chat:message:seen", handleMessageSeen);

    return () => {
      socket.off("chat:message:new", handleNewMessage);
      socket.off("chat:message:seen", handleMessageSeen);
    };
  }, [
    socket,
    queryClient,
    selectedConversationId,
    markSeen,
    profileId,
    clearUnreadCount,
    refreshNotificationQueries,
  ]);

  const handleReplyMessage = useCallback((message) => {
    setForwardingMessage(null);
    setReplyToMessage(message || null);
    setShowChat(true);
  }, []);

  const handleForwardMessage = useCallback((message) => {
    setReplyToMessage(null);
    setForwardingMessage(message || null);
    setShowChat(true);
  }, []);

  const handleForwardToContact = useCallback(
    async (targetContact) => {
      if (!forwardingMessage || !targetContact?.targetUserId) return;

      if (targetContact.targetUserId?.toString() === profileId?.toString()) {
        toastError("You cannot chat with yourself");
        return;
      }

      if (!targetContact?.isFriend) {
        toastError("Only accepted friends can message");
        return;
      }

      if (targetContact?.isBlocked) {
        toastError("User is blocked");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("text", forwardingMessage?.text?.trim() || "");
        formData.append("forwardedMessageId", forwardingMessage?._id || "");
        formData.append(
          "forwardedMessageSenderId",
          forwardingMessage?.sender?._id || "",
        );

        const mediaUrl = getMessageMediaUrl(forwardingMessage);

        if (mediaUrl) {
          try {
            const response = await fetch(mediaUrl);
            if (response.ok) {
              const blob = await response.blob();
              const isAudio = isAudioMediaUrl(
                mediaUrl,
                getMessageMediaMimeType(forwardingMessage),
              );
              const isVideo = isVideoMediaUrl(
                mediaUrl,
                getMessageMediaMimeType(forwardingMessage),
              );
              const mimeType =
                blob.type ||
                (isAudio ? "audio/webm" : isVideo ? "video/mp4" : "image/jpeg");
              const extension =
                mimeType.split("/")[1]?.split(";")[0] ||
                (isAudio ? "webm" : isVideo ? "mp4" : "jpg");
              const forwardedFile = new File(
                [blob],
                `forwarded-${Date.now()}.${extension}`,
                {
                  type: mimeType,
                },
              );
              formData.append("image", forwardedFile);
            }
          } catch {
            // Text forward still works if the media fetch fails.
          }
        }

        await sendMessage({
          targetUserId: targetContact.targetUserId,
          formData,
          meta: {
            forwardedMessage: forwardingMessage,
          },
        });

        setForwardingMessage(null);
        toastSuccess("Message forwarded");
      } catch (error) {
        toastError(
          error?.response?.data?.message || "Could not forward message",
        );
      }
    },
    [forwardingMessage, profileId, sendMessage],
  );

  const handleSendMessage = async () => {
    if (!selectedContact?.targetUserId) return;
    if (selectedContact?.targetUserId?.toString() === profileId?.toString()) {
      toastError("You cannot chat with yourself");
      return;
    }
    if (!selectedContact?.isFriend) {
      toastError("Only accepted friends can message");
      return;
    }
    if (selectedContact?.isBlocked) {
      toastError("User is blocked");
      return;
    }
    if (!newMessage.trim() && !selectedImage) return;

    try {
      const formData = new FormData();
      formData.append("text", newMessage.trim());
      if (selectedImage) {
        formData.append("image", selectedImage);
      }
      if (replyToMessage?._id) {
        formData.append("replyToMessageId", replyToMessage._id);
        formData.append(
          "replyToMessageSenderId",
          replyToMessage?.sender?._id || "",
        );
        formData.append("replyToMessageText", replyToMessage?.text || "");
      }

      const res = await sendMessage({
        targetUserId: selectedContact.targetUserId,
        formData,
        meta: {
          replyToMessage,
        },
      });
      if (res?.conversationId) {
        setSelectedContact((prev) =>
          prev
            ? {
                ...prev,
                id: res.conversationId,
                conversationId: res.conversationId,
              }
            : prev,
        );
      }
      setNewMessage("");
      setSelectedImage(null);
      setReplyToMessage(null);
      setIsOtherTyping(false);
      if (socket && selectedConversationId) {
        socket.emit("chat:typing", {
          conversationId: selectedConversationId,
          fromUserId: profileId,
          toUserId: selectedContact.targetUserId,
          isTyping: false,
        });
      }
    } catch (error) {
      toastError(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleDeleteMessage = async (message) => {
    if (!selectedConversationId || !message?._id) return;

    try {
      setDeletingMessageId(message._id);
      await deleteMessage({
        conversationId: selectedConversationId,
        messageId: message._id,
      });
      toastSuccess("Message deleted");
    } catch (error) {
      toastError(error?.response?.data?.message || "Could not delete message");
    } finally {
      setDeletingMessageId(null);
    }
  };

  const handleToggleBlockUser = async () => {
    if (!selectedContact?.targetUserId) return;

    try {
      if (selectedContact?.isBlocked) {
        const res = await unblockUser(selectedContact.targetUserId);
        setBlockedUsers((prev) => ({
          ...prev,
          [selectedContact.targetUserId]: false,
        }));
        setSelectedContact((prev) =>
          prev ? { ...prev, isBlocked: false, blockedByMe: false } : prev,
        );
        // Invalidate conversations to refetch and update UI
        queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
        toastSuccess(res?.message || "User unblocked");
      } else {
        const res = await blockUser(selectedContact.targetUserId);
        setBlockedUsers((prev) => ({
          ...prev,
          [selectedContact.targetUserId]: true,
        }));
        setSelectedContact((prev) =>
          prev
            ? { ...prev, isBlocked: true, blockedByMe: true, isOnline: false }
            : prev,
        );
        // Invalidate conversations to refetch and update UI
        queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
        toastSuccess(res?.message || "User blocked");
      }
    } catch (error) {
      toastError(
        error?.response?.data?.message || "Could not update block status",
      );
    }
  };

  // const handleAudioCall = async () => {
  //   if (!selectedContact?.targetUserId) {
  //     return;
  //   }

  //   if (selectedContact.targetUserId.toString() === profileId?.toString()) {
  //     toastError("You cannot call yourself");
  //     return;
  //   }

  //   if (!selectedContact?.isFriend) {
  //     toastError("Only accepted friends can call");
  //     return;
  //   }

  //   if (selectedContact?.isBlocked) {
  //     toastError("User is blocked");
  //     return;
  //   }

  //   const matchedProfile = profileData?.profiles?.find(
  //     (item) =>
  //       item?.id?.toString() === selectedContact?.targetUserId?.toString(),
  //   );

  //   // decide correct userId
  //   const callUserId =
  //     selectedContact?.callUserId ||
  //     selectedContact?.userId ||
  //     matchedProfile?.userId ||
  //     selectedContact?.targetUserId;

  //   try {
  //     setIsCalling(true);
  //     startAudioCall({
  //       targetUserId: callUserId,
  //     });

  //     toastSuccess("Calling...");
  //   } catch (error) {
  //     toastError(error?.message || "Call failed");
  //   } finally {
  //     setIsCalling(false);
  //   }
  // };
  const handleAudioCall = async () => {
    if (!selectedContact?.targetUserId) return;

    if (selectedContact.targetUserId.toString() === profileId?.toString()) {
      toastError("You cannot call yourself");
      return;
    }

    if (selectedContact.targetUserId.toString() === profileId?.toString()) {
      toastError("You cannot call yourself");
      return;
    }

    if (!selectedContact?.isFriend) {
      toastError("Only accepted friends can call");
      return;
    }

    if (selectedContact?.isBlocked) {
      toastError("User is blocked");
      return;
    }

    const matchedProfile = profileData?.profiles?.find(
      (item) =>
        item?.id?.toString() === selectedContact?.targetUserId?.toString(),
    );

    // decide correct userId
    const callUserId =
      selectedContact?.callUserId ||
      selectedContact?.userId ||
      matchedProfile?.userId ||
      selectedContact?.targetUserId;

    try {
      await startAudioCall({
        targetUserId: callUserId,
      });
      toastSuccess("Calling...");
    } catch (error) {
      toastError(error?.message || "Call failed");
    }
  };
  if (conversationsLoading || friendsLoading) {
    return (
      <div className="min-h-90 flex items-center justify-center">
        <Spinner className="text-emerald-600" size={44} />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-8rem)] min-h-0 w-full flex-col overflow-hidden pt-3 sm:h-[calc(100dvh-4rem)]">
      <ForwardMessageSheet
        open={!!forwardingMessage}
        onOpenChange={(open) => {
          if (!open) setForwardingMessage(null);
        }}
        message={forwardingMessage}
        contacts={forwardableContacts}
        onSelectContact={handleForwardToContact}
        isSending={isSending}
      />

      <div className="flex flex-1 min-h-0 gap-2 overflow-hidden">
        <ContactsSidebar
          contacts={contactsWithTarget}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          setShowChat={setShowChat}
          showChat={showChat}
          loadMoreRef={loadMoreRef}
          isLoadingMore={isFetchingNextPage}
        />

        <Card
          className={cn(
            "flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden border-border/40 bg-[#f8f5ee]/80 p-0 shadow-none md:rounded-[28px] md:border md:backdrop-blur dark:border-white/10 dark:bg-[#111b21]/80 ",
            showChat || !selectedContact ? "flex" : "hidden md:flex",
          )}
        >
          {!selectedContact ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No conversations yet
            </div>
          ) : (
            <div className="flex min-h-0 flex-1 flex-col">
              <ChatHeader
                contact={selectedContact}
                setShowChat={setShowChat}
                onToggleBlockUser={handleToggleBlockUser}
                isTogglingBlock={isBlockingUser || isUnblockingUser}
                isBlocked={!!selectedContact?.isBlocked}
                blockedByMe={!!selectedContact?.blockedByMe}
                onAudioCall={handleAudioCall}
                // isCalling={isCalling}
              />

              {!selectedConversationId ? (
                <div className="flex-1 flex items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                  Send a message to start chatting 💬
                </div>
              ) : (
                <MessagesList
                  messages={messages}
                  currentUserId={profileId}
                  isLoading={messagesLoading}
                  onDeleteMessage={handleDeleteMessage}
                  deletingMessageId={deletingMessageId}
                  typingUserName={selectedContact?.name}
                  isOtherTyping={isOtherTyping}
                  conversationId={selectedConversationId}
                  onReplyMessage={handleReplyMessage}
                  onForwardMessage={handleForwardMessage}
                  replyTargetMessageId={replyToMessage?._id}
                  loadMoreRef={messageLoadMoreRef}
                  isFetchingNextPage={messageIsFetchingNextPage}
                  hasNextPage={hasNextPage}
                  fetchNextPage={messageFetchNextPage}
                />
              )}

              <MessageInput
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                handleSendMessage={handleSendMessage}
                selectedFile={selectedImage}
                onFileChange={setSelectedImage}
                isSending={isSending || !!selectedContact?.isBlocked}
                isBlocked={!!selectedContact?.isBlocked}
                blockedByMe={!!selectedContact?.blockedByMe}
                replyToMessage={replyToMessage}
                onCancelReply={() => setReplyToMessage(null)}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
