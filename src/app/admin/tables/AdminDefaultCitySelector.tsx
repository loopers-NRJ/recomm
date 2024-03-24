"use client";
import { useAdminselectedCity } from "@/store/AdminSelectedCity";
import { type City } from "@prisma/client";
import { useLayoutEffect } from "react";

/**
 * Select the default state value in `adminselectedCity` when admin page loads.
 */
export function AdminDefaultCitySelector({ cities }: { cities: City[] }) {
  const selectedCity = useAdminselectedCity();
  useLayoutEffect(() => {
    const defaultState = cities[0];
    if (selectedCity.city === undefined && defaultState !== undefined) {
      selectedCity.onCityChange(defaultState);
    }
  }, [selectedCity, cities]);

  return <></>;
}
