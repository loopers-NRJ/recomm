import AdminPage from "@/hoc/AdminPage";
import RoleTable from "./RoleTable";
import { AccessType } from "@prisma/client";

const RoleTablePage = AdminPage(RoleTable, (accesses) =>
  accesses.some(
    (access) =>
      access === AccessType.createRole ||
      access === AccessType.updateRole ||
      access === AccessType.deleteRole,
  ),
);

export default RoleTablePage;
