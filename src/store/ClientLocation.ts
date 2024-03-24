import { create } from "zustand";

type LocationState = {
  coords?: { latitude: number; longitude: number };
};
type LocationAction = { setLocation: (state: LocationState["coords"]) => void };

export const useClientLocation = create<LocationState & LocationAction>(
  (set) => ({
    setLocation: (coords) => set({ coords }),
  }),
);
