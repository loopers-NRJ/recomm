import Container from "@/components/Container";
import AdminSidebar from "./AdminSidebar";
import AdminTitlebar from "./AdminTitlebar";
import { getServerAuthSession } from "@/server/auth";
import { notFound } from "next/navigation";
import { type Title } from "./titles";
import { api } from "@/trpc/server";
import { AccessType } from "@prisma/client";
import { hasAdminPageAccess } from "@/types/prisma";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  if (!session) return notFound();
  const roleId = session.user.roleId;
  if (!roleId) return notFound();
  const role = await api.role.byId.query({ id: roleId });
  if (!role) return notFound();
  const accesses = role.accesses;
  const userAccessTypes = accesses?.map((access) => access.type);
  if (!hasAdminPageAccess(userAccessTypes)) return notFound();
  const filteredTitles: Title[] = [];
  if (
    userAccessTypes?.includes(AccessType.createCategory) ||
    userAccessTypes?.includes(AccessType.updateCategory) ||
    userAccessTypes?.includes(AccessType.deleteCategory)
  ) {
    filteredTitles.push("category");
  }
  if (userAccessTypes?.includes(AccessType.updateCategory)) {
    filteredTitles.push("featured-category");
  }
  if (
    userAccessTypes?.includes(AccessType.createBrand) ||
    userAccessTypes?.includes(AccessType.updateBrand) ||
    userAccessTypes?.includes(AccessType.deleteBrand)
  ) {
    filteredTitles.push("brands");
  }
  if (
    userAccessTypes?.includes(AccessType.createModel) ||
    userAccessTypes?.includes(AccessType.updateModel) ||
    userAccessTypes?.includes(AccessType.deleteModel)
  ) {
    filteredTitles.push("models");
  }
  if (
    userAccessTypes?.includes(AccessType.updateProduct) ||
    userAccessTypes?.includes(AccessType.deleteProduct)
  ) {
    filteredTitles.push("products");
  }
  if (
    userAccessTypes?.includes(AccessType.createRole) ||
    userAccessTypes?.includes(AccessType.updateRole) ||
    userAccessTypes?.includes(AccessType.deleteRole)
  ) {
    filteredTitles.push("roles");
  }
  if (
    userAccessTypes?.includes(AccessType.deleteUser) ||
    userAccessTypes?.includes(AccessType.updateUser) ||
    userAccessTypes?.includes(AccessType.updateUsersRole)
  ) {
    filteredTitles.push("users");
  }
  if (
    userAccessTypes?.includes(AccessType.viewLogs) ||
    userAccessTypes?.includes(AccessType.clearLogs)
  ) {
    filteredTitles.push("logs");
  }

  return (
    <Container className="pt-3 md:flex md:gap-2">
      <AdminSidebar titles={filteredTitles} />
      <div className="my-4 flex grow flex-col gap-2 overflow-hidden md:m-0">
        <AdminTitlebar />
        {children}
      </div>
    </Container>
  );
}
