"use client";

import Loading from "@/components/common/Loading";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { api } from "@/trpc/react";

export default function CityPicker({
  value: selectedCities,
  onChange: handleChange,
}: {
  value: Set<string>;
  onChange: (cities: Set<string>) => void;
}) {
  const citiesApi = api.city.all.useQuery();
  if (citiesApi.isLoading || !citiesApi.data) {
    return <Loading />;
  }
  const cities = citiesApi.data.map((city) => city.value);
  return (
    <AccordionItem value="cities">
      <AccordionTrigger>
        <div className="flex items-center gap-2 font-bold">
          <Checkbox
            checked={cities.every((city) => selectedCities.has(city))}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(checked) => {
              if (checked) {
                handleChange(new Set([...cities]));
              } else {
                handleChange(new Set());
              }
            }}
          />
          cities
          <Badge>
            {[...selectedCities].reduce((acc, curr) => {
              return acc + +cities.includes(curr);
            }, 0)}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-4">
        <div className="flex flex-col gap-2">
          {cities.map((city) => (
            <Label className="flex items-center gap-2" key={city}>
              <Checkbox
                checked={selectedCities.has(city)}
                onCheckedChange={(checked) => {
                  const newSelectedRoles = new Set([...selectedCities]);
                  if (checked) {
                    newSelectedRoles.add(city);
                  } else {
                    newSelectedRoles.delete(city);
                  }
                  handleChange(newSelectedRoles);
                }}
              />
              {city}
            </Label>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
