import { create } from "zustand";

interface AdminModalStore {
  visibility: boolean;
  roomId: string;
  open: (roomId: string) => void;
  close: () => void;
  toggle: () => void;
}

const useAdminModal = create<AdminModalStore>((set) => ({
  visibility: false,
  roomId: "",
  open: (roomId: string) => {
    set({ visibility: true, roomId });
  },
  close: () => set({ visibility: false, roomId: "" }),
  toggle: () => set((state) => ({ ...state, visibility: !state.visibility })),
}));

export default useAdminModal;
