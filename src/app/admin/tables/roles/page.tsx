import AdminPage from "@/hoc/AdminPage";
import RoleTable from "./RoleTable";
import { AccessType } from "@prisma/client";

const RoleTablePage = AdminPage(RoleTable, [
  AccessType.readAccess,
  AccessType.createRole,
  AccessType.deleteRole,
  AccessType.updateRole,
]);

export default RoleTablePage;
