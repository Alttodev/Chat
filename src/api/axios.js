import axiosInstance from "./axiosInstance";


export const userSignup = async (formData) => {
  const { data } = await axiosInstance.post(`/user/signup`, formData);
  return data;
};

export const userLogin = async (formData) => {
  const { data } = await axiosInstance.post(`/user/login`, formData);
  return data;
};
