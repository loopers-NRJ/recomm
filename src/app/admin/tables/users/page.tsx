import AdminPage from "@/hoc/AdminPage";
import UserTable from "./UserTable";
import { AccessType } from "@prisma/client";

const UserTablePage = AdminPage(UserTable, [
  AccessType.readAccess,
  AccessType.updateUser,
  AccessType.deleteUser,
  AccessType.updateUsersRole,
]);

export default UserTablePage;
