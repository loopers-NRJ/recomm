import { setUserLocation } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function LocationUpdater() {
  const { data: session } = useSession();
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
