import {
  getNotificationCounts,
  getNotifications,
  markNotificationSeen,
  getNotificationSettings,
  updateNotificationSettings,
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

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ["notification_settings"],
    queryFn: getNotificationSettings,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings) => updateNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_settings"] });
    },
  });
};
