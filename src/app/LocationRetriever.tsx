"use client";

import { useClientLocation } from "@/store/ClientLocation";
import { useEffect } from "react";

export default function LocationRetriever() {
  const setClientLocation = useClientLocation((state) => state.setLocation);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setClientLocation(position.coords);
      },
      (error) => {
        if (error.PERMISSION_DENIED || error.POSITION_UNAVAILABLE) {
          // handle permission denied
        }
      },
    );
  }, []);

  return <></>;
}
