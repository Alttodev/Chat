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
  media: [],
  currentIndex: 0,
  isOpen: false,

  open: (media, currentIndex = 0) =>
    set({
    media: Array.isArray(media) ? media : [media],
      currentIndex,
      isOpen: true,
    }),

  close: () =>
    set({
      media: [],
      currentIndex: 0,
      isOpen: false,
    }),

  next: () =>
    set((state) => ({
      currentIndex:
        state.currentIndex < state.media.length - 1
          ? state.currentIndex + 1
          : state.currentIndex,
    })),

  prev: () =>
    set((state) => ({
      currentIndex: state.currentIndex > 0 ? state.currentIndex - 1 : 0,
    })),
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

export const useProfileEdit = create((set) => ({
  isOpen: false,
  modalData: null,

  openProfile: (data) =>
    set({
      isOpen: true,
      modalData: data,
    }),

  closeProfile: () =>
    set({
      isOpen: false,
      modalData: null,
    }),
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

export const useAIPromptStore = create((set) => ({
  isOpen: false,
  prompt: "",
  isGenerating: false,
  target: "post",

  openDialog: (target = "post") =>
    set({
      isOpen: true,
      target,
    }),

  closeDialog: () =>
    set({
      isOpen: false,
      prompt: "",
      isGenerating: false,
      target: "post",
    }),

  setPrompt: (prompt) => set({ prompt }),
  setGenerating: (value) => set({ isGenerating: value }),
}));

export const useChatMessageMetaStore = create(
  persist(
    (set) => ({
      messageMetaById: {},
      setMessageMeta: (messageId, meta) =>
        set((state) => ({
          messageMetaById: {
            ...state.messageMetaById,
            [messageId]: meta,
          },
        })),
      clearMessageMeta: (messageId) =>
        set((state) => {
          if (!messageId) return { messageMetaById: {} };

          const nextMeta = { ...state.messageMetaById };
          delete nextMeta[messageId];
          return { messageMetaById: nextMeta };
        }),
    }),
    {
      name: "chat-message-meta",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ messageMetaById: state.messageMetaById }),
    },
  ),
);
