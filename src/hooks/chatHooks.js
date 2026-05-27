import {
  blockChatUser,
  deleteChatMessage,
  getChatConversations,
  getChatMessages,
  markConversationSeen,
  sendChatMessage,
  unblockChatUser,
} from "@/api/axios";
import { useChatMessageMetaStore } from "@/lib/zustand";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useChatConversations = () => {
  return useQuery({
    queryKey: ["chat_conversations"],
    queryFn: getChatConversations,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
};

export const useChatMessages = (conversationId) => {
  return useQuery({
    queryKey: ["chat_messages", conversationId],
    queryFn: () => getChatMessages({ conversationId }),
    enabled: !!conversationId,
    refetchOnWindowFocus: true,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  });
};

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId, formData }) =>
      sendChatMessage({ targetUserId, formData }),
    onSuccess: (res, variables) => {
      const conversationId = res?.conversationId || res?.conversation?._id;
      const chatMessage =
        res?.chatMessage ||
        res?.data?.chatMessage ||
        (res?.message && typeof res.message === "object" ? res.message : null);
      const meta = variables?.meta || {};
      const mergedMessage = chatMessage
        ? {
            ...chatMessage,
            ...(meta.replyToMessage ? { replyToMessage: meta.replyToMessage } : {}),
            ...(meta.forwardedMessage
              ? { forwardedMessage: meta.forwardedMessage }
              : {}),
          }
        : null;

      if (conversationId && mergedMessage) {
        if (mergedMessage?._id && meta && Object.keys(meta).length > 0) {
          useChatMessageMetaStore
            .getState()
            .setMessageMeta(mergedMessage._id, meta);
        }

        queryClient.setQueryData(
          ["chat_messages", conversationId],
          (oldData) => {
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
                messages: [mergedMessage],
              };
            }

            const exists = currentMessages.some(
              (item) => item?._id === mergedMessage?._id
            );
            if (exists) return oldData;

            return {
              ...oldData,
              messages: [...currentMessages, mergedMessage],
            };
          }
        );
      }

      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
    },
  });
};

export const useMarkConversationSeen = () => {
  return useMutation({
    mutationFn: (conversationId) => markConversationSeen(conversationId),
  });
};

export const useDeleteChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId }) => deleteChatMessage(messageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat_messages", variables.conversationId],
        exact: true,
      });
      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
    },
  });
};

export const useBlockChatUser = () => {
  return useMutation({
    mutationFn: (targetUserId) => blockChatUser(targetUserId),
  });
};

export const useUnblockChatUser = () => {
  return useMutation({
    mutationFn: (targetUserId) => unblockChatUser(targetUserId),
  });
};
