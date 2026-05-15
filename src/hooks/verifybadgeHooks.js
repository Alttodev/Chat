import { requestVerifiedBadge } from "@/api/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useRequestVerifiedBadge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: requestVerifiedBadge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["userDetail"] });
    },
  });
};

