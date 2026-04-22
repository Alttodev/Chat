import {
  getNotificationCounts,
  getNotifications,
  markNotificationSeen,
} from "@/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useNotifications = (limit = 30) => {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => getNotifications({ limit }),
    refetchOnWindowFocus: false,
  });
};

export const useNotificationCounts = () => {
  return useQuery({
    queryKey: ["notification_counts"],
    queryFn: getNotificationCounts,
    refetchOnWindowFocus: false,
  });
};

export const useMarkNotificationSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => markNotificationSeen(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notification_counts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (variables?.type === "chat-message") {
        queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
      }
    },
  });
};
