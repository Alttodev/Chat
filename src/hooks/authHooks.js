import { userCreate, userLogin, userReset, userResetPassword, userSignup } from "@/api/axios";
import { useMutation } from "@tanstack/react-query";

export const useUserSignup = () => {
  return useMutation({
    mutationFn: (formData) => userSignup(formData),
  });
};

export const useUserLogin = () => {
  return useMutation({
    mutationFn: (formData) => userLogin(formData),
  });
};

export const useUserCreate = () => {
  return useMutation({
    mutationFn: (formData) => userCreate(formData),
  });
};

export const useUserReset = () => {
  return useMutation({
    mutationFn: (formData) => userReset(formData),
  });
};

export const useUserResetPassword = () => {
  return useMutation({
    mutationFn: ({ id, token, password }) =>
      userResetPassword({ id, token, password }),
  });
};