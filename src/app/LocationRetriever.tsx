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
  const [unavailable, setUnavailable] = useState(false);
  const [manualLocation, setManualLocation] = useState(false);

  const { city, onCityChange } = useClientselectedCity()
  const { data } = api.city.all.useQuery();

  const map: Record<string, City> = {}
  data?.forEach((city) => {
    map[city.value] = city;
  });

  const [selected, setSelected] = useState<City>();

  const changetoCity = api.city.mapFromCoordinates.useMutation({
    onSuccess: (data) => {
      if (typeof data === "string") {
        setUnavailable(true);
        setManualLocation(true);
        return;
      }
      onCityChange(data);
      setManualLocation(false);
    },
  });

  const getLocation = () => {
    try {
      const cache = localStorage.getItem('city');
      if (cache) {
        onCityChange(JSON.parse(cache));
        return;
      }
    } catch (err) {}
    if (!city)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          changetoCity.mutate({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          if (error.PERMISSION_DENIED || error.POSITION_UNAVAILABLE) {
            setManualLocation(true);
          }
        },
      );
  }

  useEffect(() => {
    getLocation();
  }, []);

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
        {unavailable && <p className="mx-auto text-sm text-red-500">City not found. Please choose manually</p>}
      </DialogContent>
    </Dialog>
  </>;
}
