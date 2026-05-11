import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const useZustandPopup = create((set) => ({
  isOpen: false,
  modalData: null,
  openModal: (data) => set({ isOpen: true, modalData: data }),
  closeModal: () => set({ isOpen: false, modalData: null }),
}));

export const useZustandImagePopup = create((set) => ({
  isImageOpen: false,
  modalImageData: null,
  openImageModal: (data) => set({ isImageOpen: true, modalImageData: data }),
  closeImageModal: () => set({ isImageOpen: false, modalImageData: null }),
}));

export const useCommentStore = create((set) => ({
  openPostId: null,
  toggleComments: (postId) =>
    set((state) => ({
      openPostId: state.openPostId === postId ? null : postId,
    })),
  setOpenPostId: (postId) => set({ openPostId: postId }),
}));

export const useZustandSharePopup = create((set) => ({
  isShareOpen: false,
  modalShareData: null,
  openShareModal: (data) => set({ isShareOpen: true, modalShareData: data }),
  closeShareModal: () => set({ isShareOpen: false, modalShareData: null }),
}));

export const useImageModalStore = create((set) => ({
  image: null,
  isOpen: false,

  open: (img) => set({ image: img, isOpen: true }),
  close: () => set({ image: null, isOpen: false }),
}));

export const useStatusViewerStore = create((set) => ({
  isOpen: false,
  status: null,

  openStatus: (status) => set({ isOpen: true, status }),
  closeStatus: () => set({ isOpen: false, status: null }),
}));

export const useIncomingCallStore = create((set) => ({
  isOpen: false,
  incomingCall: null,

  openIncomingCall: (callData) => set({ isOpen: true, incomingCall: callData }),
  closeIncomingCall: () => set({ isOpen: false, incomingCall: null }),
}));

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),
    }),
    {
      name: "chat-theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);
