"use client";
import Search from "../search/Searchbar";
import Image from "next/image";
import RecommLogo from "@/../public/recomm.png";
import Profile from "./profile";
import Container from "../Container";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
import { Bell } from "lucide-react";
import { useEffect } from "react";

const MobileNavbar = () => {
  const { data: session } = useSession();

  const pathname = usePathname();

  return (
    <Container className="navbar sticky left-0 top-0 z-30 w-full bg-white">
      <nav className="w-full space-y-5 py-5">
        <div className="flex w-full items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image
              className="h-full w-full cursor-pointer"
              src={RecommLogo}
              height="100"
              width="100"
              alt="Logo"
              priority
            />
          </Link>
          {/* notification and profile buttons */}
          <div className="flex items-center gap-2">
            {session && session.user ?
              <Notification pathname={pathname} /> :
              <Link href="/login" className="relative flex items-center px-[5px] border border-black rounded-full">
                <Bell strokeWidth={1.5} className="h-5 w-5 my-[5px]" />
              </Link>
            }
            <Profile session={session} />
          </div>
        </div>
        {/* Search bar and location selector */}
        {pathname == "/" && (
          <div className="flex w-full gap-2">
            <Search />
            <p className="items-center justify-center border p-2">Location</p>
          </div>
        )}
      </nav>
    </Container>
  );
};

export const Notification = ({ pathname }: { pathname: string }) => {

  const { data, refetch } = api.inbox.all.useQuery({});
  const unread = data?.notifications.filter(n => !n.read).length ?? 0;

  useEffect(() => void refetch(), [pathname])

  return (
    <a href="/notifications"
      className={cn("relative flex items-center px-[5px] border-[1px] border-black rounded-full", {
        "bg-sky-500 border-sky-500": pathname === "/notifications"
      })}>
      <Bell strokeWidth={1.5}
        className={cn("h-5 w-5 my-[5px]", {
          "text-white": pathname === "/notifications",
        })} />
      {unread > 0 &&
        <div className="font-bold text-xs absolute -top-2 right-0 text-white leading-none bg-red-600 px-2 py-1 rounded-full">
          {unread}
        </div>}
    </a>
  )
}

export default MobileNavbar;
