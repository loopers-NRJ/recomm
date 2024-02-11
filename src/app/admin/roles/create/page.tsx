import AdminPage from "@/hoc/AdminPage";
import CreateRole from "./CreateRole";
import { AccessType } from "@prisma/client";

const CreateRolePage = AdminPage(CreateRole, AccessType.createRole);
export default CreateRolePage;
