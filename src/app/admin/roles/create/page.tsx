import AdminPage from "@/hoc/AdminPage";
import CreateRole from "./CreateRole";
import { AccessType } from "@prisma/client";

const CreateRolePage = AdminPage(CreateRole, [
  AccessType.readAccess,
  AccessType.createRole,
  AccessType.deleteRole,
  AccessType.updateRole,
]);
export default CreateRolePage;
