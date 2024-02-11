import AdminPage from "@/hoc/AdminPage";
import UserTable from "./UserTable";
import { AccessType } from "@prisma/client";

const UserTablePage = AdminPage(UserTable, (accesses) =>
  accesses.some(
    (access) =>
      access === AccessType.updateUser ||
      access === AccessType.updateUsersRole ||
      access === AccessType.deleteUser,
  ),
);

export default UserTablePage;
