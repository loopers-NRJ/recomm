import { create } from "zustand";

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationState {
  location?: Location;
  onStateChange: (location?: Location) => void;
}

/**
 * This is a zustand store that keeps track of the user's location in the client.
 */
export const useUserLocation = create<LocationState>((set) => ({
  state: undefined,
  onStateChange: (location) => set({ location }),
}));
