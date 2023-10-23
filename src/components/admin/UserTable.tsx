import { useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./Table";
import {
  DefaultLimit,
  DefaultSearch,
  SortBy,
  DefaultSortBy,
  SortOrder,
  DefaultSortOrder,
} from "@/utils/constants";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { UserPayloadIncluded } from "@/types/prisma";

const UserTable = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const limit = +(params.get("limit") ?? DefaultLimit);

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;

  const usersApi = api.user.getUsers.useQuery({
    limit,
    search,
    sortBy,
    sortOrder,
  });

  const rolesApi = api.search.role.useQuery();

  const updateUserRole = api.user.updateUserRole.useMutation();

  const columns: ColumnDef<UserPayloadIncluded>[] = [
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => row.name,
    },
    {
      id: "email",
      header: "Email",
      accessorFn: (row) => row.email,
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row: { original: user } }) => {
        if (rolesApi.isLoading) {
          return <div>Loading...</div>;
        }
        if (rolesApi.isError) {
          console.log(rolesApi.error);
          return <div>Error</div>;
        }
        return (
          <Select
            defaultValue={user.role?.id ?? "user"}
            onValueChange={(value) => {
              const roleId = value === "user" ? null : value;
              void updateUserRole
                .mutateAsync({
                  userId: user.id,
                  roleId,
                })
                .then(() => {
                  void usersApi.refetch();
                });
            }}
          >
            <SelectTrigger className="w-[180px]">
              {user.role?.name ?? "User"}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              {rolesApi.data.map((role) => (
                <SelectItem value={role.id} key={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      id: "lastactive",
      header: "last Seen",
      accessorFn: (row) => row.lastActive?.toLocaleString("en-US") ?? "N/A",
    },
    {
      id: "createdAt",
      header: "Created At",
      accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
    },
  ];

  if (usersApi.isLoading) {
    return <div>Loading...</div>;
  }
  if (usersApi.isError) {
    console.log(usersApi.error);
    return <div>Error</div>;
  }
  return <DataTable columns={columns} data={usersApi.data.users} />;
};

export default UserTable;
