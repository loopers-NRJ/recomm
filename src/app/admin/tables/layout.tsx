import Container from "@/components/Container";
import Sidebar from "./Sidebar";
import Titlebar from "./Titlebar";
import { getServerAuthSession } from "@/server/auth";
import { notFound } from "next/navigation";
import { titles } from "./titles";
import { api } from "@/trpc/server";
import { AccessType } from "@prisma/client";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session) return notFound();
  const roleId = session.user.roleId;
  if (!roleId) return notFound();
  const accesses = (await api.role.byId.query({ id: roleId }))?.accesses;
  const userAccessTypes = accesses?.map((access) => access.type);
  if (!userAccessTypes?.includes(AccessType.readAccess)) return notFound();
  let filteredTitles = [...titles];
  if (
    !userAccessTypes?.includes(AccessType.createRole) ||
    !userAccessTypes?.includes(AccessType.deleteRole) ||
    !userAccessTypes?.includes(AccessType.updateRole)
  ) {
    filteredTitles = filteredTitles.filter((title) => title !== "roles");
  }
  if (
    !userAccessTypes?.includes(AccessType.deleteUser) ||
    !userAccessTypes?.includes(AccessType.updateUser) ||
    !userAccessTypes?.includes(AccessType.updateUsersRole)
  ) {
    filteredTitles = filteredTitles.filter((title) => title !== "users");
  }

  return (
    <Container className="pt-3 md:flex md:gap-2">
      <Sidebar titles={filteredTitles} />
      <div className="my-4 flex grow flex-col gap-2 overflow-hidden md:m-0">
        <Titlebar />
        {children}
      </div>
    </Container>
  );
}
