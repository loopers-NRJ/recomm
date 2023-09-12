import { currentModal } from "@/components/modals/core/current-modal";
import { Modals } from "@/components/modals/core/modals-config";

export const useModal = <P>(name: Modals) => {
  return {
    open: (props: P) => {
      currentModal.set({ name, props });
    },
    close: () => {
      currentModal.set(null);
    },
  };
};
