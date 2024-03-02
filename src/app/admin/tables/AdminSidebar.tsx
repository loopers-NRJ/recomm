"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AdminButtonLink } from "@/components/common/ButtonLink";
import { usePathname, useRouter } from "next/navigation";
import { type Title } from "./titles";

export default function AdminSidebar({ titles }: { titles: Title[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const selectedTitle = pathname.replace("/admin/tables/", "");

  return (
    <>
      <nav className="md:hidden">
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
      </nav>
      <div className="hidden h-fit w-40 shrink-0 flex-col rounded-lg border md:flex">
        {/* <div className="flex h-full flex-col"> */}
        {titles.map((title) => (
          <AdminButtonLink
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
          </AdminButtonLink>
        ))}
        {/* </div> */}
      </div>
    </>
  );
}
