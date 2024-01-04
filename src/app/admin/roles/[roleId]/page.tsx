import AdminPage from "@/hoc/AdminPage";
import RoleEdit from "./RoleEdit";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

const RoleEditPage = AdminPage<{ roleId: string }>(async (props) => {
  const role = await api.role.byId.query({ id: props.params.roleId });
  if (!role) {
    return notFound();
  }
  return <RoleEdit role={role} />;
});
export default RoleEditPage;
