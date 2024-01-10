import Container from "@/components/Container";
import Logo from "./Logo";
import NavItems from "./NavItems";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { getServerAuthSession } from "@/server/auth";
import { type Session } from "next-auth";
import NotificationLink from "./NotificationLink";
import { api } from "@/trpc/server";
import { AccessType } from "@prisma/client";
import AdminButton from "./AdminButton";

const Profile = ({ session }: { session: Session | null }) => {
  return (
    <Link
      href={session ? `/user/${session.user.id}/profile` : "/login"}
      className="rounded-full"
    >
      <Button
        variant="ghost"
        asChild
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

export default async function Navbar() {
  const session = await getServerAuthSession();
  const roleId = session?.user.roleId;
  let isAdmin = false;
  if (roleId) {
    try {
      const role = await api.role.byId.query({ id: roleId });
      const accesses = role?.accesses.map((access) => access.type);
      if (accesses?.includes(AccessType.readAccess)) {
        isAdmin = true;
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <div className="sticky left-0 top-0 z-10 w-full bg-white">
      <div className="py-4">
        <Container>
          <div className="flex w-full flex-col items-center justify-between gap-5 pt-3">
            <div className="flex w-full items-center justify-between">
              <Logo />
              <div className="flex h-full w-fit items-center justify-center gap-2">
                <div className="hidden md:inline">
                  <NavItems session={session}>
                    {isAdmin && <AdminButton />}
                  </NavItems>
                </div>
                <Profile session={session} />
                <NotificationLink session={session} />
              </div>
            </div>
            {/* <div className="flex w-full justify-between gap-3">
              <Search />
              <p className="flex w-fit items-center rounded-lg border px-3 py-2">
                Location
              </p>
            </div> */}
          </div>
        </Container>
      </div>
    </div>
  );
}
