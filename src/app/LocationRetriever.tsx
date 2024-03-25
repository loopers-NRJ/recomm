"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useClientselectedCity } from "@/store/ClientSelectedCity";
import { api } from "@/trpc/react";
import type { City } from "@prisma/client";
import { useEffect, useState } from "react";


export default function LocationRetriever() {
  const getClosetCity = (latitude: number, longitude: number) => {
    const map: Record<string, number[]> = {
      "Chennai": [13.0827, 80.2707],
      "Bengaluru": [12.9716, 77.5946]
    }
    let min = Infinity;
    let closestCity: string | undefined = undefined;
    for (const city in map) {
      const cord = map[city] as [number, number];
      const distance = Math.sqrt(
        (latitude - cord[0]) ** 2 +
        (longitude - cord[1]) ** 2
      );
      if (distance < min) {
        min = distance;
        closestCity = city;
      }
    }
    return closestCity;
  }

  const [manualLocation, setManualLocation] = useState(false);
  const { city, onCityChange } = useClientselectedCity()
  const { data, isLoading } = api.city.all.useQuery();

  const map: Record<string, City> = {};
  data?.forEach((city) => {
    map[city.value] = city;
  });

  const [selected, setSelected] = useState<City>();

  useEffect(() => {
    console.log("useEffect", isLoading);
    const cache = localStorage.getItem('city');
    if (cache) {
      try {
        onCityChange(JSON.parse(cache));
      } catch (err) { }
      return;
    }
    if (!isLoading) {
      navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const closest = getClosetCity(latitude, longitude);
          if (closest === undefined ) {
            setManualLocation(true);
            return;
          }
          onCityChange(map[closest]!);
        },
        (error) => {
          if (error.PERMISSION_DENIED || error.POSITION_UNAVAILABLE && !cache) {
            setManualLocation(true);
          }
        },
      );
    }
  }, [isLoading]);

  return <>
    <Dialog open={manualLocation} onOpenChange={setManualLocation}>
      <DialogTrigger asChild>
        <Button variant="outline">{city?.value ?? "Location"}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <Button variant="outline">Give Location Access</Button>
        </DialogHeader>
        <div className="flex items-center justify-around">
          <Separator className="w-[40%]" orientation="horizontal" />
          or
          <Separator className="w-[40%]" orientation="horizontal" />
        </div>
        <DialogFooter>
          <div className="flex gap-2">
            <Select onValueChange={(val) => setSelected(map[val])}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                {data?.map((city) => (
                  <SelectItem key={city.value} value={city.value} >
                    {city.value}
                  </SelectItem>))}
              </SelectContent>
            </Select>
            <Button
              disabled={selected === undefined ? true : false}
              onClick={() => {
                onCityChange(selected!);
                localStorage.setItem('city', JSON.stringify(selected));
                setManualLocation(false);
              }}
              className="bg-sky-500 focus:bg-sky-500 hover:bg-sky-500 active:bg-sky-700"
            >
              Submit
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>;
}
