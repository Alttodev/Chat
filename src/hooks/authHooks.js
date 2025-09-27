import {
  getAllProfiles,
  getProfile,
  userCreate,
  userLogin,
  userReset,
  userResetPassword,
  userSignup,
  userUpdate,
} from "@/api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

//update

export const useUserUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData) => userUpdate(formData),
    onSuccess: () => {
      queryClient.invalidateQueries(["user"]);
    },
  });
};

//get

export const useUserDetail = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: () => getProfile(),
    cacheTime: 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};

export const useUserProfiles = () => {
  return useQuery({
    queryKey: ["user_profiles"],
    queryFn: () => getAllProfiles(),
    cacheTime: 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  });
};



