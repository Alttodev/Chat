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


export const getProfile = async () => {
  const { data } = await axiosInstance.get(`/profile/me`);
  return data;
};
