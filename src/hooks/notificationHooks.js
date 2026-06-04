import {
  getNotificationCounts,
  getNotifications,
  markNotificationRead,
  getNotificationSettings,
  updateNotificationSettings,
} from "@/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useNotifications = (limit = 30) => {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => getNotifications({ limit }),
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
};

export const useNotificationCounts = () => {
  return useQuery({
    queryKey: ["notification_counts"],
    queryFn: getNotificationCounts,
    refetchOnWindowFocus: true,
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification_counts"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
