import { type City } from "@prisma/client";
import { create } from "zustand";
import { type selectedCityType } from "./ClientSelectedCity";
import { citySchema } from "@/utils/validation";

/**
 * This is a zustand store that keeps track of the selected city in the admin panel.
 */
export const useAdminselectedCity = create<selectedCityType>((set) => {
  const KEY = "adminselectedCity";
  let city: City | undefined = undefined;

  if (typeof localStorage !== "undefined") {
    const storedCity = localStorage.getItem(KEY)!;

    const result = citySchema.safeParse(JSON.parse(storedCity));
    if (result.success) {
      city = result.data;
    }
  }
  return {
    city: city,
    onCityChange: (city: City) => {
      set({ city });
      localStorage.setItem(KEY, JSON.stringify(city));
    },
  };
});
