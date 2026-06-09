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

import { useInfiniteQuery } from "@tanstack/react-query";

export const useChatMessages = (conversationId) => {
  return useInfiniteQuery({
    queryKey: ["chat_messages", conversationId],

    queryFn: ({ pageParam = 1 }) =>
      getChatMessages({
        conversationId,
        page: pageParam,
      }),

    enabled: !!conversationId,

    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextPage : undefined;
    },
    refetchInterval: 3000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
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
            ...(meta.replyToMessage
              ? { replyToMessage: meta.replyToMessage }
              : {}),
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
            if (!oldData?.pages?.length) {
              return oldData;
            }

            const firstPage = oldData.pages[0];

            const exists = firstPage.messages.some(
              (msg) => msg._id === mergedMessage._id,
            );

            if (exists) return oldData;

            return {
              ...oldData,
              pages: [
                {
                  ...firstPage,
                  messages: [...firstPage.messages, mergedMessage],
                },
                ...oldData.pages.slice(1),
              ],
            };
          },
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
