import AdminPage from "@/hoc/AdminPage";
import UserTable from "./UserTable";
import { AccessType } from "@prisma/client";
import { superAdminAccesses } from "@/types/prisma";

const UserTablePage = AdminPage(
  ({ accesses }) => {
    const canAccessConfiguration = superAdminAccesses.every((access) =>
      accesses.includes(access),
    );
    return <UserTable canAccessConfiguration={canAccessConfiguration} />;
  },
  (accesses) =>
    accesses.some(
      (access) =>
        access === AccessType.updateUser ||
        access === AccessType.updateUsersRole ||
        access === AccessType.deleteUser,
    ),
);

export default UserTablePage;
