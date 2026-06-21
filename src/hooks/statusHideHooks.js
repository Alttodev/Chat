import axiosInstance from "@/api/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";


export function useHideStatusUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => axiosInstance.post(`/status/hide/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status_feed"] });
    },
  });
}

export function useUnhideStatusUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => axiosInstance.post(`/status/unhide/${userId}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["status_feed"] });
    },
  });
}
