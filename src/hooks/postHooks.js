import {
  getUserPost,
  getUserPostInfo,
  userPost,
  userPostDelete,
  userPostLike,
  userPostUpdate,
} from "@/api/axios";
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

export const usePostDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => userPostDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["user_post"]);
    },
  });
};

export const usePostUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => userPostUpdate(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["user_post"]);
    },
  });
};

export const usePostInfo = (id) => {
  return useQuery({
    queryKey: ["user_post_info"],
    queryFn: () => getUserPostInfo(id),
    cacheTime: 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};
