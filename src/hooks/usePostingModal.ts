import { create } from "zustand";

interface PostingModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const usePostingModal = create<PostingModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default usePostingModal;
