import { create } from "zustand";

interface BiddingModalStore {
  isOpen: boolean;
  roomId: string;
  onOpen: (roomId: string) => void;
  onClose: () => void;
}

const useBiddingModal = create<BiddingModalStore>((set) => ({
  isOpen: false,
  roomId: "",
  onOpen: (roomId: string) => {
    set({ isOpen: true, roomId });
  },
  onClose: () => set({ isOpen: false, roomId: "" }),
}));

export default useBiddingModal;
