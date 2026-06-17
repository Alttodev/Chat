import axios from "axios";
import { useAuthStore } from "@/store/authStore";

const API_URL = import.meta.env.VITE_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const onLoginPage = window.location.pathname === "/";

      localStorage.removeItem("chat-storage");

      if (!onLoginPage) {
        window.location.replace("/");
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;