"use client"
import { useUserLocation } from "@/store/userLocation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function LocationUpdater() {
  const { data: session } = useSession();
  const setUserLocation = useUserLocation((state) => state.onStateChange);
  useEffect(() => {
    if (session?.user) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(position.coords);
        },
        () => {
          // TODO: handle error
        },
      );
    }
  }, [session]);
  return null;
}
