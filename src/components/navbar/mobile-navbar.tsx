"use client"
import Search from "../search/Searchbar";
import Image from "next/image";
import RecommLogo from "@/../public/recomm.png";
import Profile from "./profile";
import Container from "../Container";
import Link from "next/link";
import { Bell } from "./Icons";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const MobileNavbar = () => {
  const { data: session } = useSession();
  const pathname = usePathname();

  const style = "font-medium border text-md flex items-center justify-center w-fit p-3 rounded-md hover:bg-slate-100"

  return (
    <Container className="navbar sticky left-0 top-0 z-10 w-full bg-white">
      <nav className="space-y-5 py-5 w-full">
        <div className="flex w-full items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Image className="cursor-pointer w-full h-full" src={RecommLogo} height="100" width="100" alt="Logo" priority />
          </Link>
          {/* notification and profile buttons */}
          <div className="flex items-center gap-2">
            <Link href="/notifications"
              className={cn(style + (pathname == "/notifications" ? "text-red-300 border border-red-300" : ""), "rounded-full")}
            >
              <Bell className="h-5 w-5" />
            </Link>
            <Profile session={session} />
          </div>
        </div>
        {/* Search bar and location selector */}
        {pathname == "/" && (
          <div className="flex w-full gap-2">
            <Search />
            <p className="p-2 items-center justify-center border">Location</p>
          </div>
        )}
      </nav>
    </Container>
  );
}

export default MobileNavbar;
