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
    formData
  );
  return data;
};

export const userResetPassword = async ({ id, token, password }) => {
  const { data } = await axiosInstance.post(
    `/auth/resetpassword/${id}/${token}`,
    { password }
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

export const userPostComment = async (id, formData) => {
  const { data } = await axiosInstance.post(`/posts/${id}/comment`, formData);
  return data;
};

export const userFollowRequest = async (id) => {
  const { data } = await axiosInstance.post(`/follow/send/${id}`);
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

export const getUserPost = async ({ pageParam = 1 }) => {
  const { data } = await axiosInstance.get(
    `/post/list?page=${pageParam}&limit=5`
  );
  return data;
};

export const getUserInfoPost = async ({ id, pageParam = 1 }) => {
  const { data } = await axiosInstance.get(
    `/post/list/${id}?page=${pageParam}&limit=5`
  );
  return data;
};

export const getUserPostInfo = async (id) => {
  const { data } = await axiosInstance.get(`/post/info/${id}`);
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
    `/follow/requests/${fromId}/${toId}`
  );
  return data;
};

export const getFriendsList = async () => {
  const { data } = await axiosInstance.get(`/follow/friends`);
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

//delete

export const userPostDelete = async (id) => {
  const { data } = await axiosInstance.delete(`/post/delete/${id}`);
  return data;
};

export const userCommentDelete = async ({ postId, commentId }) => {
  const { data } = await axiosInstance.delete(
    `/posts/${postId}/comment/${commentId}`
  );
  return data;
};
