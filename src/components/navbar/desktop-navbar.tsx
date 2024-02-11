import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import Container from "../Container";
import Image from "next/image";
import RecommLogo from "@/../public/recomm.png";
import Search from "../search/Searchbar";
import NavItems from "./NavItems";
import { hasAdminPageAccess } from "@/types/prisma";

const DesktopNavbar = async () => {
  const session = await getServerAuthSession();
  const roleId = session?.user.roleId;
  let isAdmin = false;
  if (roleId) {
    try {
      const role = await api.role.byId.query({ id: roleId });
      const accesses = role?.accesses.map((access) => access.type);
      if (hasAdminPageAccess(accesses)) {
        isAdmin = true;
      }
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <Container className="navbar sticky left-0 top-0 z-10 w-full bg-white">
      <nav className="flex w-full items-center justify-between py-5">
        <div className="flex gap-2">
          <Image
            className="h-full w-full cursor-pointer"
            src={RecommLogo}
            height="30"
            width="150"
            alt="Logo"
            priority
          />
          <Search />
          <p className="flex w-fit items-center justify-center rounded-md border p-2 text-sm">
            Location
          </p>
        </div>
        <NavItems isAdmin={isAdmin} session={session ?? undefined} />
      </nav>
    </Container>
  );
};

export default DesktopNavbar;
