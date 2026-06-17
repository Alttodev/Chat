import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isEditing: false,
      profileId: null,
      setProfileId: (profileId) => set({ profileId }),
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      openEditing: () => set({ isEditing: true }),
      closeEditing: () => set({ isEditing: false }),
      clearToken: () => set({ token: null }),
      resetAuth: () =>
        set({
          token: null,
          user: null,
          profileId: null,
          isEditing: false,
        }),
    }),
    {
      name: "chat-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
