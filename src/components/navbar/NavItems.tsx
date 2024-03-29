"use client";

import { usePathname } from "next/navigation";
import type { FC } from "react";
import Link from "next/link";
import { ADMIN_PAGE_REGEX } from "@/utils/constants";
import { Bell } from "./Icons";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";
import Profile from "./profile";

interface NavItemsProps {
  isAdmin: boolean;
  session?: Session;
}

const NavItems: FC<NavItemsProps> = ({ isAdmin, session }) => {
  const pathname = usePathname();
  const isAdminPage = !!pathname.match(ADMIN_PAGE_REGEX);
  const content = [
    { text: "Home", path: "/" },
    { text: "Favourites", path: "/favourites" },
    { text: "Wish It", path: "/wishlist" },
    { text: "Sell It", path: "/sell" },
  ];

  const style =
    "border text-sm flex items-center justify-center w-fit min-w-fit p-2 rounded-md hover:bg-slate-100";

  return (
    <div className="flex h-full w-full items-center justify-end gap-2">
      {isAdmin && (
        <Link
          href="/admin"
          className={
            style + (isAdminPage ? "border border-red-300 text-red-300" : "")
          }
        >
          Admin
        </Link>
      )}
      {content.map((item, i) => (
        <Link
          key={i}
          href={item.path}
          className={
            style +
            (pathname === item.path ? "border border-red-300 text-red-300" : "")
          }
        >
          {item.text}
        </Link>
      ))}
      <Link
        href="/notifications"
        className={cn(
          style +
            (pathname == "/notifications"
              ? "border border-red-300 text-red-300"
              : ""),
          "rounded-full",
        )}
      >
        <Bell className="h-5 w-5" />
      </Link>
      <Profile session={session ?? null} />
    </div>
  );
};
export default NavItems;
