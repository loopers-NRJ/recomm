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
import { errorHandler } from "@/utils/errorHandler";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CityUpdater({
  roleId,
  value: selectedCities,
}: {
  roleId: string;
  value: Set<string>;
}) {
  const router = useRouter();
  const citiesApi = api.city.all.useQuery();
  const addCity = api.role.addCity.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      router.refresh();
    },
    onError: errorHandler,
  });
  const removeCity = api.role.removeCity.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      router.refresh();
    },
    onError: errorHandler,
  });
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
            disabled={addCity.isLoading || removeCity.isLoading}
            onCheckedChange={(checked) => {
              if (checked) {
                addCity.mutate({
                  roleId,
                  cities: cities.filter((city) => !selectedCities.has(city)),
                });
              } else {
                removeCity.mutate({
                  roleId,
                  cities: [...selectedCities],
                });
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
                disabled={
                  (addCity.isLoading &&
                    addCity.variables?.cities.includes(city)) ??
                  (removeCity.isLoading &&
                    removeCity.variables?.cities.includes(city))
                }
                checked={selectedCities.has(city)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addCity.mutate({
                      roleId,
                      cities: [city],
                    });
                  } else {
                    removeCity.mutate({
                      roleId,
                      cities: [city],
                    });
                  }
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
