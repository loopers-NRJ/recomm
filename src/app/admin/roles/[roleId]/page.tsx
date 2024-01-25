import AdminPage from "@/hoc/AdminPage";
import EditRole from "./EditRole";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import { AccessType } from "@prisma/client";

const RoleEditPage = AdminPage<{ roleId: string }>(
  async (props) => {
    const role = await api.role.byId.query({ id: props.params.roleId });
    if (!role) {
      return notFound();
    }
    return <EditRole role={role} />;
  },
  [
    AccessType.readAccess,
    AccessType.createRole,
    AccessType.deleteRole,
    AccessType.updateRole,
  ],
);
export default RoleEditPage;
