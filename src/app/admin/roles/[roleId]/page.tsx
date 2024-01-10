import AdminPage from "@/hoc/AdminPage";
import EditRole from "./EditRole";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

const RoleEditPage = AdminPage<{ roleId: string }>(async (props) => {
  const role = await api.role.byId.query({ id: props.params.roleId });
  if (!role) {
    return notFound();
  }
  return <EditRole role={role} />;
});
export default RoleEditPage;
