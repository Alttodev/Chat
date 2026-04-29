import {
  getFollowRequestInfo,
  getFriendsCount,
  getFriendsList,
  getRequestList,
  getUserFollowers,
  getUserInfoCount,
  getUserInfoPost,
  getUserPost,
  getUserPostComments,
  getUserPostInfo,
  userCommentDelete,
  userFollowRequest,
  userFollowRequestUpdate,
  userPost,
  userPostComment,
  userPostDelete,
  userPostLike,
  userPostUpdate,
  userRequestDelete,
} from "@/api/axios";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const usePostCreate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => userPost(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_post"] });
    },
  });
};

export const useProfileFollow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => userFollowRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["request_info"] });
      queryClient.invalidateQueries({ queryKey: ["follow_request"] });
      queryClient.invalidateQueries({ queryKey: ["user-followers"] });
    },
  });
};

export const usePostLike = () => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => userPostLike(id),
    onSuccess: () => {
      // queryClient.invalidateQueries(["user_post"]);
      // queryClient.invalidateQueries(["user_Info_post"]);
    },
  });
};

export const usePostComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => userPostComment(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comment", variables.id],
        exact: true,
      });
    },
  });
};

//get

export const usePostList = () => {
  return useInfiniteQuery({
    queryKey: ["user_post"],
    queryFn: getUserPost,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage <= lastPage.totalPages
        ? lastPage.nextPage
        : undefined;
    },
    refetchOnWindowFocus: false,
  });
};

export const useUserPostList = (id) => {
  return useInfiniteQuery({
    queryKey: ["user_Info_post", id],
    queryFn: ({ pageParam = 1 }) => getUserInfoPost({ id, pageParam }),
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage <= lastPage.totalPages
        ? lastPage.nextPage
        : undefined;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};

export const usePostInfo = (id) => {
  return useQuery({
    queryKey: ["user_post_info", id],
    queryFn: () => getUserPostInfo(id),
    enabled: !!id,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const usePostComments = (id) => {
  return useQuery({
    queryKey: ["comment", id],
    queryFn: () => getUserPostComments(id),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useRequestList = () => {
  return useQuery({
    queryKey: ["follow_request"],
    queryFn: () => getRequestList(),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useRequestListInfo = ({ fromId, toId }) => {
  return useQuery({
    queryKey: ["request_info", fromId, toId],
    queryFn: () => getFollowRequestInfo({ fromId, toId }),
    enabled: !!fromId && !!toId,
    refetchOnWindowFocus: false,
  });
};

export const useFriendsList = () => {
  return useQuery({
    queryKey: ["friends"],
    queryFn: () => getFriendsList(),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useUserFollowers = (id) => {
  return useQuery({
    queryKey: ["user-followers", id],
    queryFn: () => getUserFollowers(id),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// getFriendsCount

export const useFriendsCount = () => {
  return useQuery({
    queryKey: ["friends-count"],
    queryFn: () => getFriendsCount(),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

//getUserInfoCount
export const useUserInfoCount = (id) => {
  return useQuery({
    queryKey: ["user-count", id],
    queryFn: () => getUserInfoCount(id),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

//update

export const useFollowRequestUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => userFollowRequestUpdate(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["follow_request"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friends-count"] });
      queryClient.invalidateQueries({ queryKey: ["request_info"] });
      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
    },
  });
};

export const usePostUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => userPostUpdate(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_Info_post"] });
      queryClient.invalidateQueries({ queryKey: ["user_post"] });
    },
  });
};

// delete

export const usePostDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => userPostDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_Info_post"] });
      queryClient.invalidateQueries({ queryKey: ["user_post"] });
    },
  });
};

export const usePostCommentDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars) => userCommentDelete(vars),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comment", variables.postId],
        exact: true,
      });
    },
  });
};

export const useRequestDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ fromId, toId }) => userRequestDelete({ fromId, toId }),
    onSuccess: (_, variables) => {
      // Refetch specific request info query
      queryClient.refetchQueries({
        queryKey: ["request_info", variables.fromId, variables.toId],
      });

      // Invalidate other related queries
      queryClient.invalidateQueries({ queryKey: ["follow_request"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friends-count"] });
      queryClient.invalidateQueries({ queryKey: ["request_info"] });
      queryClient.invalidateQueries({ queryKey: ["chat_conversations"] });
    },
  });
};
