"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAdminselectedCity } from "@/store/AdminSelectedCity";
import { usePathname } from "next/navigation";
import { type City } from "@prisma/client";

function filterAndRenameTitle(title: string) {
  if (title.endsWith("reports")) {
    title = "Reports";
  }
  if (title.endsWith("coupons")) {
    title = "Coupons";
  }
  return title;
}

export default function AdminTitlebar({ cities }: { cities: City[] }) {
  const selectedCity = useAdminselectedCity();
  const pathname = usePathname();
  const selectedTitle = filterAndRenameTitle(
    pathname.replace("/admin/tables/", ""),
  );
  if (selectedTitle === "logs") return;

  return (
    <div className="flex w-full items-center justify-between">
      <h1 className="pl-2 font-bold capitalize">{selectedTitle}</h1>

      <Select
        onValueChange={(value) => {
          const city = cities.find((city) => city.value === value);
          if (!city) return;
          selectedCity.onCityChange(city);
        }}
        value={selectedCity.city?.value ?? ""}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {cities.map((city) => (
            <SelectItem value={city.value} key={city.value}>
              {city.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
