import { State } from "@prisma/client";
import { create } from "zustand";

interface SelectedStateType {
  state: State;
  onStateChange: (state: State) => void;
}

export const useSelectedState = create<SelectedStateType>((set) => ({
  state: State.Tamil_Nadu,
  onStateChange: (state: State) => set({ state }),
}));
