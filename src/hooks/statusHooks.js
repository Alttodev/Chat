import {
  getMyStatus,
  getStatusFeed,
  markStatusSeen,
  uploadUserStatus,
} from "@/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMyStatus = () => {
  return useQuery({
    queryKey: ["my_status"],
    queryFn: () => getMyStatus(),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useStatusFeed = () => {
  return useQuery({
    queryKey: ["status_feed"],
    queryFn: () => getStatusFeed(),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useUploadStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => uploadUserStatus(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my_status"] });
      queryClient.invalidateQueries({ queryKey: ["status_feed"] });
    },
  });
};

export const useMarkStatusSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markStatusSeen,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status_feed"] });
    },
  });
};
