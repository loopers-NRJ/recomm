"use client";

import Link from "next/link";
import { type Session } from "next-auth";
import { usePathname } from "next/navigation";
import { Bell } from "./Icons";

export default function NotificationLink({
  session,
}: {
  session: Session | null;
}) {
  const pathname = usePathname();
  return (
    <Link
      className={
        pathname === "/notifications"
          ? "rounded-full bg-slate-100 p-2"
          : "rounded-full p-2"
      }
      href={session ? "/notifications" : "/login"}
    >
      <Bell className="h-6 w-6" />
    </Link>
  );
}
