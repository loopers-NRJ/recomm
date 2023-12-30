"use client";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminSelectedState } from "@/store/SelectedState";
import { states } from "@/types/prisma";
import type { State } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { titles } from "./titles";

export default function layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const selectedTitle = pathname.replace("/admin/tables/", "");

  const selectedState = useAdminSelectedState();

  return (
    <Container className="pt-3 md:flex md:gap-2">
      <div className="md:hidden">
        <Select
          onValueChange={(value) => router.push(`/admin/tables/${value}`)}
          value={selectedTitle}
        >
          <SelectTrigger className="w-[180px] capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {titles.map((title) => (
              <SelectItem value={title} key={title} className="capitalize">
                {title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="hidden h-fit w-40 shrink-0 rounded-lg border md:block">
        <div className="flex h-full flex-col">
          {titles.map((title) => (
            <Button
              key={title}
              className={`
                justify-start rounded-none
                ${
                  title === selectedTitle
                    ? "bg-accent text-accent-foreground"
                    : ""
                }
              `}
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/tables/${title}`)}
            >
              {title}
            </Button>
          ))}
        </div>
      </div>
      <div className="my-4 flex grow flex-col gap-2 overflow-hidden md:m-0">
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

        {children}
      </div>
    </Container>
  );
}
