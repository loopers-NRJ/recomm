"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { states } from "@/types/prisma";
import type { State } from "@prisma/client";
import { useAdminSelectedState } from "@/store/SelectedState";
import { usePathname } from "next/navigation";

export default function Titlebar() {
  const selectedState = useAdminSelectedState();
  const pathname = usePathname();
  const selectedTitle = pathname.replace("/admin/tables/", "");

  return (
    <div className="flex w-full items-center justify-between">
      <h1 className="pl-2 font-bold capitalize">
        {selectedTitle.replace("-", " ")}
      </h1>
      <Select
        onValueChange={(value) => {
          selectedState.onStateChange(value as State);
        }}
        value={selectedState.state}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="h-80">
          {states.map((state) => (
            <SelectItem value={state} key={state}>
              {state.replace("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
