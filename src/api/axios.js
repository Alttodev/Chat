import axiosInstance from "./axiosInstance";

export const userSignup = async (formData) => {
  const { data } = await axiosInstance.post(`/auth/signup`, formData);
  return data;
};

export const userLogin = async (formData) => {
  const { data } = await axiosInstance.post(`/auth/login`, formData);
  return data;
};

export const userCreate = async (formData) => {
  const { data } = await axiosInstance.post(`/profile/create`, formData);
  return data;
};

export const userReset = async (formData) => {
  const { data } = await axiosInstance.post(
    `/auth/requestPasswordReset`,
    formData,
  );
  return data;
};

export const userResetPassword = async ({ id, token, password }) => {
  const { data } = await axiosInstance.post(
    `/auth/resetpassword/${id}/${token}`,
    { password },
  );
  return data;
};

export const userPost = async (formData) => {
  const { data } = await axiosInstance.post(`/post/create`, formData);
  return data;
};

export const userPostLike = async (id) => {
  const { data } = await axiosInstance.post(`/post/${id}/like`);
  return data;
};

export const userPostBookmark = async (id) => {
  const { data } = await axiosInstance.post(`/post/${id}/bookmark`);
  return data;
};

export const userPostComment = async (id, formData) => {
  const { data } = await axiosInstance.post(`/posts/${id}/comment`, formData);
  return data;
};

export const userPostCommentReaction = async ({ postId, commentId, type }) => {
  const { data } = await axiosInstance.post(
    `/posts/${postId}/comment/${commentId}/reaction`,
    { type },
  );
  return data;
};

// status

export const markStatusSeen = async (statusId) => {
  const res = await axiosInstance.post(`/status/seen/${statusId}`);
  return res.data;
};

export const uploadUserStatus = async (formData) => {
  const { data } = await axiosInstance.post(`/status/upload`, formData);
  return data;
};

export const getMyStatus = async () => {
  try {
    const { data } = await axiosInstance.get(`/status/me`);
    return data;
  } catch (error) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

export const getStatusFeed = async () => {
  const { data } = await axiosInstance.get(`/status/feed`);
  return data;
};

export const userFollowRequest = async (id) => {
  const { data } = await axiosInstance.post(`/follow/send/${id}`);
  return data;
};
export const deleteMyStatus = async () => {
  const res = await axiosInstance.delete("/status/delete");
  return res.data;
};

export const markPublicAccount = async (isPublic) => {
  const res = await axiosInstance.patch("/user/privacy", {
    isPublic,
  });

  return res.data;
};

//profileViews
export const markProfileViewSeen = async (statusId) => {
  const res = await axiosInstance.post(`/profileviews/seen/${statusId}`);
  return res.data;
};

export const getProfileViewSeen = async () => {
  const { data } = await axiosInstance.get(`/profileviews/seens`);
  return data;
};

//verified badge

export const requestVerifiedBadge = async () => {
  const { data } = await axiosInstance.post(`/verification/request`);
  return data;
};

// notifications

export const getNotifications = async ({ limit = 30 } = {}) => {
  const { data } = await axiosInstance.get(`/notifications?limit=${limit}`);
  return data;
};

export const getNotificationCounts = async () => {
  const { data } = await axiosInstance.get(`/notifications/counts`);
  return data;
};

export const markNotificationRead = async (notificationId) => {
  const { data } = await axiosInstance.put(
    `/notifications/${notificationId}/read`,
  );
  return data;
};

export const getNotificationSettings = async () => {
  const { data } = await axiosInstance.get(`/profile/notification-settings`);
  return data;
};

export const updateNotificationSettings = async (settings) => {
  const { data } = await axiosInstance.put(
    `/profile/notification-settings`,
    settings,
  );
  return data;
};

// chat

export const getChatConversations = async () => {
  const { data } = await axiosInstance.get(`/chat/conversations`);
  return data;
};

export const getChatMessages = async ({
  conversationId,
  page = 1,
  limit = 30,
}) => {
  const { data } = await axiosInstance.get(
    `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
  );
  return data;
};

export const sendChatMessage = async ({ targetUserId, formData }) => {
  const { data } = await axiosInstance.post(
    `/chat/conversations/${targetUserId}/messages`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

export const markConversationSeen = async (conversationId) => {
  const { data } = await axiosInstance.put(
    `/chat/conversations/${conversationId}/seen`,
  );
  return data;
};

export const deleteChatMessage = async (messageId) => {
  const { data } = await axiosInstance.delete(`/chat/messages/${messageId}`);
  return data;
};

export const blockChatUser = async (targetUserId) => {
  const { data } = await axiosInstance.post(`/chat/blocks/${targetUserId}`);
  return data;
};

export const unblockChatUser = async (targetUserId) => {
  const { data } = await axiosInstance.delete(`/chat/blocks/${targetUserId}`);
  return data;
};

//update

export const userUpdate = async (formData) => {
  const { data } = await axiosInstance.put(`/profile/update`, formData);
  return data;
};

export const userPostUpdate = async (id, formData) => {
  const { data } = await axiosInstance.put(`/post/update/${id}`, formData);
  return data;
};

export const userFollowRequestUpdate = async (id, formData) => {
  const { data } = await axiosInstance.put(`/follow/${id}/respond`, formData);
  return data;
};

//get

export const getProfile = async () => {
  const { data } = await axiosInstance.get(`/profile/me`);
  return data;
};

export const getAllProfiles = async () => {
  const { data } = await axiosInstance.get(`/profile/userProfiles`);
  return data;
};

export const getAllUsersProfile = async () => {
  const { data } = await axiosInstance.get(`/profile/chart`);
  return data;
};

export const getUserPost = async ({ pageParam = 1 }) => {
  const { data } = await axiosInstance.get(
    `/post/list?page=${pageParam}&limit=5`,
  );
  return data;
};

export const getUserPostVideos = async ({ pageParam = 1 }) => {
  const { data } = await axiosInstance.get(
    `/post/videos?page=${pageParam}&limit=5`,
  );
  return data;
};

export const getUserInfoPost = async ({ id, pageParam = 1 }) => {
  const { data } = await axiosInstance.get(
    `/post/list/${id}?page=${pageParam}&limit=5`,
  );
  return data;
};

export const getUserPostInfo = async (id) => {
  const { data } = await axiosInstance.get(`/post/info/${id}`);
  return data;
};

export const getHashtagPosts = async (tag, page = 1) => {
  const { data } = await axiosInstance.get(
    `/post/hashtags/${tag}?page=${page}&limit=5`,
  );

  return data;
};

export const getBookmarkedPosts = async (page = 1, limit = 5) => {
  const { data } = await axiosInstance.get(
    `/post/bookmarked?page=${page}&limit=${limit}`,
  );

  return data;
};

export const getPostLikedUsers = async (id) => {
  const { data } = await axiosInstance.get(`/post/${id}/liked-users`);
  return data;
};

export const getUserPostComments = async (id) => {
  const { data } = await axiosInstance.get(`/posts/${id}/comments`);
  return data;
};

export const getRequestList = async () => {
  const { data } = await axiosInstance.get(`/follow/requests`);
  return data;
};

export const getFollowRequestInfo = async ({ fromId, toId }) => {
  const { data } = await axiosInstance.get(
    `/follow/requests/${fromId}/${toId}`,
  );
  return data;
};

export const getFriendsList = async (pageParam = 1, limit = 5) => {
  const { data } = await axiosInstance.get(
    `/follow/friends?page=${pageParam}&limit=${limit}`,
  );

  return data;
};

export const getRecommendedConnections = async () => {
  const { data } = await axiosInstance.get(`/follow/connections/recommended`);
  return data;
};

export const getFriendsCount = async () => {
  const { data } = await axiosInstance.get(`/follow/counts`);
  return data;
};

export const getUserInfoCount = async (id) => {
  const { data } = await axiosInstance.get(`/follow/counts/${id}`);
  return data;
};

export const getUserFollowers = async (id, pageParam = 1, limit = 5) => {
  const { data } = await axiosInstance.get(
    `/follow/friends/${id}?page=${pageParam}&limit=${limit}`,
  );
  return data;
};

export const getUserFollowing = async (id, pageParam = 1, limit = 5) => {
  const { data } = await axiosInstance.get(
    `/follow/friends/following/${id}?page=${pageParam}&limit=${limit}`,
  );
  return data;
};

//delete

export const userPostDelete = async (id) => {
  const { data } = await axiosInstance.delete(`/post/delete/${id}`);
  return data;
};

export const userCommentDelete = async ({ postId, commentId }) => {
  const { data } = await axiosInstance.delete(
    `/posts/${postId}/comment/${commentId}`,
  );
  return data;
};

export const userRequestDelete = async ({ fromId, toId }) => {
  const { data } = await axiosInstance.delete(
    `/follow/delete/requests/${fromId}/${toId}`,
  );
  return data;
};


export const submitPuzzleResult = async ({
  userId,
  puzzleId = null,
  score = 0,
  timeMs = 0,
}) => {
  const { data } = await axiosInstance.post(`/game/puzzle/submit`, {
    userId,
    puzzleId,
    score,
    timeMs,
  });

  return data;
};
