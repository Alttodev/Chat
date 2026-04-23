import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance";

export const useSearchUsers = (query, enabled = true) => {
  return useQuery({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      if (!query) {
        return { profiles: [] };
      }
      const response = await axiosInstance.get("/profile/search", {
        params: { query },
      });
      return response.data;
    },
    enabled: enabled && query?.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
