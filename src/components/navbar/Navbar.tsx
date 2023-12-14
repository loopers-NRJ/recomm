import { useSession } from "next-auth/react";

import Container from "@/components/Container";
import Search from "@/components/search/Searchbar";

import Logo from "./Logo";
import NavItems from "./NavItems";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const Bell = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
    />
  </svg>
);

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <div className="sticky left-0 top-0 z-10 w-full bg-white">
      <div className="py-4">
        <Container>
          <div className="flex w-full flex-col items-center justify-between gap-5 pt-3">
            <div className="flex w-full items-center justify-between">
              <Logo />
              <div className="flex h-full w-fit items-center justify-center gap-2">
                <div className="hidden md:inline">
                  <NavItems session={session} />
                </div>
                <Profile />
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
              </div>
            </div>
            <div className="flex w-full justify-between gap-3">
              <Search />
              <p className="flex w-fit items-center rounded-md border px-3 py-2">
                Location
              </p>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

const Profile = () => {
  const { data: session } = useSession();
  return (
    <Link
      href={session ? `/users/${session.user.id}/profile` : "/login"}
      className="rounded-full"
    >
      <Button
        variant="ghost"
        className="h-fit w-fit overflow-hidden rounded-full p-1.5 "
      >
        <Image
          className="rounded-full"
          height={30}
          width={30}
          alt="Avatar"
          src={session?.user.image ?? "/placeholder.jpg"}
        />
      </Button>
    </Link>
  );
};

export default Navbar;
