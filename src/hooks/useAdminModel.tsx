import { create } from "zustand";

interface AdminModalStore {
  visibility: boolean;
  open: (roomId: string) => void;
  close: () => void;
  toggle: () => void;
}

const useAdminModal = create<AdminModalStore>((set) => ({
  visibility: false,
  open: () => {
    set({ visibility: true });
  },
  close: () => set({ visibility: false }),
  toggle: () => set((state) => ({ ...state, visibility: !state.visibility })),
}));

export default useAdminModal;
