import {
  getRequestList,
  getUserInfoPost,
  getUserPost,
  getUserPostComments,
  getUserPostInfo,
  userCommentDelete,
  userFollowRequest,
  userPost,
  userPostComment,
  userPostDelete,
  userPostLike,
  userPostUpdate,
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
      queryClient.invalidateQueries(["user_post"]);
    },
  });
};



export const useProfileFollow = () => {
  // const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => userFollowRequest(id),
    // onSuccess: () => {
    //   queryClient.invalidateQueries(["user_post"]);
    // },
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

export const usePostList = () => {
  return useInfiniteQuery({
    queryKey: ["user_post"],
    queryFn: getUserPost,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage <= lastPage.totalPages
        ? lastPage.nextPage
        : undefined;
    },
    cacheTime: 0,
    refetchOnWindowFocus: false,
  });
};

export const useUserPostList = (id) => {
  return useInfiniteQuery({
    queryKey: ["user_Info_post"],
    queryFn: () => getUserInfoPost(id),
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage <= lastPage.totalPages
        ? lastPage.nextPage
        : undefined;
    },
    enabled: !!id,
    cacheTime: 0,
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
    queryKey: ["user_post_info",id],
    queryFn: () => getUserPostInfo(id),
    cacheTime: 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const usePostComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }) => userPostComment(id, formData),
    onSuccess: (_,id) => {
      queryClient.invalidateQueries(["comment",id]);
    },
  });
};

// getUserPostComments

export const usePostComments = (id) => {
  return useQuery({
    queryKey: ["comment",id],
    queryFn: () => getUserPostComments(id),
    cacheTime: 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};



export const useRequestList = () => {
  return useQuery({
    queryKey: ["follow_request"],
    queryFn: () => getRequestList(),
    cacheTime: 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

// delete comment

export const usePostCommentDelete = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (vars) => userCommentDelete(vars),
    onSuccess: () => {
      queryClient.invalidateQueries(["comment"]);
    },
  });
};
