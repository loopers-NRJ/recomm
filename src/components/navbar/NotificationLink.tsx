"use client";

import { type Session } from "next-auth";
import { usePathname } from "next/navigation";
import { Bell } from "./Icons";
import { ButtonLink } from "../common/ButtonLink";

export default function NotificationLink({
  session,
}: {
  session: Session | null;
}) {
  const pathname = usePathname();
  return (
    <ButtonLink
      className={
        pathname === "/notifications"
          ? "rounded-full bg-slate-100 p-2"
          : "rounded-full p-2"
      }
      href={session ? "/notifications" : "/login"}
      variant="ghost"
    >
      <Bell className="h-6 w-6" />
    </ButtonLink>
  );
}
