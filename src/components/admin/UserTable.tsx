import { useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./Table";
import {
  DefaultSearch,
  SortBy,
  DefaultSortBy,
  SortOrder,
  DefaultSortOrder,
  DefaultLimit,
} from "@/utils/constants";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { UserPayloadIncluded } from "@/types/prisma";
import { Button } from "../ui/button";
import Link from "next/link";
import Loading from "../common/Loading";
import ServerError from "../common/ServerError";
import { useMemo } from "react";

const UserTable = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const limit = +(params.get("limit") ?? DefaultLimit);
  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;
  const usersApi = api.user.getUsers.useInfiniteQuery(
    {
      limit,
      search,
      sortBy,
      sortOrder,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const rolesApi = api.search.role.useQuery();

  const updateUserRole = api.user.updateUserRole.useMutation();

  const columns: ColumnDef<UserPayloadIncluded>[] = useMemo(
    () => [
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
        id: "latitude",
        header: "latitude",
        accessorFn: (row) => row.latitude,
      },
      {
        id: "longitude",
        header: "longitude",
        accessorFn: (row) => row.longitude,
      },
      {
        id: "map",
        header: "map view",
        cell: ({ row: { original: user } }) => (
          <Button
            variant="ghost"
            disabled={user.latitude === null || user.longitude === null}
            size="sm"
            className="p-0"
          >
            <Link
              href={`https://www.google.com/maps/@${user.latitude},${user.longitude}`}
              className="flex h-full w-full items-center justify-center px-3"
            >
              view
            </Link>
          </Button>
        ),
      },
      {
        id: "createdAt",
        header: "Created At",
        accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
      },
    ],
    [
      rolesApi.data,
      rolesApi.error,
      rolesApi.isError,
      rolesApi.isLoading,
      updateUserRole,
      usersApi,
    ]
  );

  if (usersApi.isLoading) {
    return <Loading />;
  }
  if (usersApi.isError) {
    return <ServerError message={usersApi.error.message} />;
  }

  return (
    <DataTable
      columns={columns}
      data={usersApi.data.pages.flatMap((page) => page.users)}
      canViewMore={!!usersApi.hasNextPage}
      viewMore={() => {
        void usersApi.fetchNextPage();
      }}
    />
  );
};

export default UserTable;
