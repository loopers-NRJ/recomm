import { type City } from "@prisma/client";
import { create } from "zustand";

export interface selectedCityType {
  city?: City;
  onCityChange: (city: City) => void;
}

/**
 * This is a zustand store that keeps track of the selected city in the client.
 * use this to set the city in the client.
 */
export const useClientselectedCity = create<selectedCityType>((set) => ({
  onCityChange: (city: City) => set({ city }),
}));
