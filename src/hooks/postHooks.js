// userPost
import {  getUserPost, userPost, userPostLike } from "@/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const usePostCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => userPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["user_post"]);
    },
  });
};

export const usePostLike = () => {
  return useMutation({
    mutationFn: (id) => userPostLike(id),
  });
};

export const usePostList = () => {
  return useQuery({
    queryKey: ["user_post"],
    queryFn: () => getUserPost(),
    cacheTime: 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};
