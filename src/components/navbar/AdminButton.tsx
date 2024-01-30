"use client";

import { usePathname } from "next/navigation";
import { ButtonLink } from "../common/ButtonLink";
import { adminPageRegex } from "@/utils/constants";

export default function AdminButton() {
  const pathname = usePathname();
  const isAdminPage = !!pathname.match(adminPageRegex);
  return (
    <ButtonLink
      href="/admin"
      variant="ghost"
      className={`h-full w-full min-w-max flex-col justify-between rounded-lg px-6 md:flex-row md:px-4 md:py-2 ${
        isAdminPage
          ? "rounded-b-none border-b-2 border-b-black md:rounded-lg md:border-none md:bg-slate-200/50"
          : ""
      }`}
    >
      <span className="text-xs md:text-sm">Admin</span>
    </ButtonLink>
  );
}
