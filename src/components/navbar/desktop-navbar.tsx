import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import { AccessType } from "@prisma/client";
import Container from "../Container";
import Image from "next/image";
import RecommLogo from "@/../public/recomm.png";
import Search from "../search/Searchbar";
import NavItems from "./NavItems";

const DesktopNavbar = async () => {
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
    <Container className="navbar sticky left-0 top-0 z-10 w-full bg-white">
      <nav className="flex items-center justify-between py-5 w-full">
        <div className="flex gap-2">
          <Image className="cursor-pointer w-full h-full" src={RecommLogo} height="30" width="150" alt="Logo" priority />
          <Search />
          <p className="border flex items-center justify-center p-2 w-fit text-sm rounded-md">Location</p>
        </div>
        <NavItems isAdmin={isAdmin} session={session ?? undefined} />
      </nav>
    </Container>
  )
}

export default DesktopNavbar
