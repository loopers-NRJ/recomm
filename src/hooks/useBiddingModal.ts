import { create } from "zustand";

interface BiddingModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useBiddingModal = create<BiddingModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useBiddingModal;
