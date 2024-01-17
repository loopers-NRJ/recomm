"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ButtonLink } from "@/components/common/ButtonLink";
import { usePathname, useRouter } from "next/navigation";
import { type Title } from "./titles";

export default function Sidebar({ titles }: { titles: Title[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const selectedTitle = pathname.replace("/admin/tables/", "");

  return (
    <>
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
            <ButtonLink
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
              href={`/admin/tables/${title}`}
            >
              {title}
            </ButtonLink>
          ))}
        </div>
      </div>
    </>
  );
}
