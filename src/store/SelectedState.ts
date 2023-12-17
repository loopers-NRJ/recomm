import { State } from "@prisma/client";
import { create } from "zustand";

interface SelectedStateType {
  state: State;
  onStateChange: (state: State) => void;
}

/**
 * This is a zustand store that keeps track of the selected state in the admin panel.
 */
export const useAdminSelectedState = create<SelectedStateType>((set) => ({
  state: State.Tamil_Nadu,
  onStateChange: (state: State) => set({ state }),
}));

/**
 * This is a zustand store that keeps track of the selected state in the client.
 * use this to set the state in the client.
 */
export const useClientSelectedState = create<SelectedStateType>((set) => ({
  state: State.Tamil_Nadu,
  onStateChange: (state: State) => set({ state }),
}));
