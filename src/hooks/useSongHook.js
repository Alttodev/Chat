import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/api/axiosInstance"; // your existing axios instance

export function useSongs(search = "") {
  return useQuery({
    queryKey: ["songs", search],
    queryFn: async () => {
      const res = await axiosInstance.get("/songs", {
        params: { q: search, per_page: 20 },
      });
      return res.data.songs;
    },
    staleTime: 1000 * 60 * 24, 
    placeholderData: [],
  });
}