import { useQuery } from "@tanstack/react-query";
import { getSubscriptionStatus } from "@/api/subscription";

export const useSubscriptionStatus = () => {
  return useQuery({
    queryKey: ["subscription-status"],
    queryFn: async () => {
      const result = await getSubscriptionStatus();

      if (!result.success) {
        throw new Error(
          result.error || "Failed to fetch subscription status"
        );
      }

      return result.data;
    },
    // staleTime: 1000 * 60 * 5, // 5 minutes
  });
};