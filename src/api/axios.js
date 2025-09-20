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

//update

export const userUpdate = async (formData) => {
  const { data } = await axiosInstance.put(`/profile/update`, formData);
  return data;
};

//get

export const getProfile = async () => {
  const { data } = await axiosInstance.get(`/profile/me`);
  return data;
};

export const getUserPost = async () => {
  const { data } = await axiosInstance.get(`/post/list`);
  return data;
};
