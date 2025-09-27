import { create } from "zustand";

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
}));


export const useZustandSharePopup = create((set) => ({
  isShareOpen: false,
  modalShareData: null,
  openShareModal: (data) => set({ isShareOpen: true, modalShareData: data }),
  closeShareModal: () => set({ isShareOpen: false, modalShareData: null }),
}));
