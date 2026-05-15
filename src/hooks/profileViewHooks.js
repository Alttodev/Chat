import { getProfileViewSeen, markProfileViewSeen } from "@/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useMarkProfileViewSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markProfileViewSeen,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileviews"] });
    },
  });
};


export const useProfileViewSeen = () => {
  return useQuery({
    queryKey: ["profileviews"],
    queryFn: () =>getProfileViewSeen(),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};
