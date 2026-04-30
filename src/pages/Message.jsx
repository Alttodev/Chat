import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import ContactsSidebar from "@/components/Message/ContactsSidebar";
import MessagesList from "@/components/Message/MessagesList";
import MessageInput from "@/components/Message/MessageInput";
import ChatHeader from "@/components/Message/ChatHeader";
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
import { useJitsiCall } from "@/lib/jitsiCall";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useUserProfiles } from "@/hooks/authHooks";

export default function Message() {
  const BLOCKED_USERS_STORAGE_KEY = "chat-blocked-users";
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { startAudioCall } = useJitsiCall();
  const { profileId } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
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
  const [isCalling, setIsCalling] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const typingStopTimeoutRef = useRef(null);
  const typingResetTimeoutRef = useRef(null);
  const targetUserIdFromUrl = searchParams.get("userId");
  const targetUserNameFromUrl = searchParams.get("name");

  const { data: conversationData, isLoading: conversationsLoading } =
    useChatConversations();
  const { data: friendsData, isLoading: friendsLoading } = useFriendsList();
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
    const friendRows = friendsData?.friends || [];

    const acceptedFriends = friendRows.filter(
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
        lastMessageText:
          conversation?.lastMessage?.text ||
          (conversation?.lastMessage?.type === "image" ? "Image" : ""),
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

  useEffect(() => {
    if (!contactsWithTarget.length) return;
    if (targetUserIdFromUrl) {
      const matched = contactsWithTarget.find(
        (item) => item?.targetUserId?.toString() === targetUserIdFromUrl,
      );

      if (matched) {
        const currentTargetId = selectedContact?.targetUserId?.toString();
        const nextTargetId = matched?.targetUserId?.toString();

        if (currentTargetId !== nextTargetId) {
          setSelectedContact(matched);
        }
      } else if (!selectedContact) {
        setSelectedContact(contactsWithTarget[0]);
      }

      setShowChat(true);
      return;
    }

    if (!selectedContact) {
      setSelectedContact(contactsWithTarget[0]);
    }
  }, [contactsWithTarget, selectedContact, targetUserIdFromUrl]);

  useEffect(() => {
    if (!selectedContact?.targetUserId || selectedContact?.conversationId)
      return;

    const matched = contacts.find(
      (item) =>
        item?.targetUserId?.toString() ===
        selectedContact?.targetUserId?.toString(),
    );

    if (matched) {
      setSelectedContact(matched);
    }
  }, [contacts, selectedContact]);

  useEffect(() => {
    setNewMessage("");
    setSelectedImage(null);
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

  const { data: messageData, isLoading: messagesLoading } = useChatMessages(
    selectedConversationId,
    {
      enabled: !!selectedConversationId,
    },
  );

  const messages = useMemo(() => {
    if (Array.isArray(messageData?.messages)) return messageData.messages;
    if (Array.isArray(messageData?.chatMessages))
      return messageData.chatMessages;
    if (Array.isArray(messageData?.data?.messages))
      return messageData.data.messages;
    return [];
  }, [messageData]);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      const res = await sendMessage({
        targetUserId: selectedContact.targetUserId,
        formData,
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

  const handleAudioCall = async () => {

    if (!selectedContact?.targetUserId) {
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
      setIsCalling(true);
      startAudioCall({
        targetUserId: callUserId,
      });

      toastSuccess("Calling...");
    } catch (error) {
      toastError(error?.message || "Call failed");
    } finally {
      setIsCalling(false);
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
    <div className="w-full h-screen flex flex-col bg-background">
      <div className="flex flex-1 gap-2 overflow-hidden">
        <ContactsSidebar
          contacts={contactsWithTarget}
          selectedContact={selectedContact}
          setSelectedContact={setSelectedContact}
          setShowChat={setShowChat}
          showChat={showChat}
        />

        <Card
          className={cn(
            "flex-1 flex flex-col p-0 overflow-hidden",
            showChat || !selectedContact ? "flex" : "hidden md:flex",
          )}
        >
          {!selectedContact ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
              No conversations yet
            </div>
          ) : (
            <>
              <ChatHeader
                contact={selectedContact}
                setShowChat={setShowChat}
                onToggleBlockUser={handleToggleBlockUser}
                isTogglingBlock={isBlockingUser || isUnblockingUser}
                isBlocked={!!selectedContact?.isBlocked}
                blockedByMe={!!selectedContact?.blockedByMe}
                onAudioCall={handleAudioCall}
                isCalling={isCalling}
              />

              {!selectedConversationId ? (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                  Send a message to start chatting 💬
                </div>
              ) : (
                <MessagesList
                  messages={messages}
                  messagesEndRef={messagesEndRef}
                  currentUserId={profileId}
                  isLoading={messagesLoading}
                  onDeleteMessage={handleDeleteMessage}
                  deletingMessageId={deletingMessageId}
                  typingUserName={selectedContact?.name}
                  isOtherTyping={isOtherTyping}
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
              />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
