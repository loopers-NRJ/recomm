import { RouterInputs, api } from "@/utils/api";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./Table";
import { SortOrder, DefaultSortOrder, DefaultSortBy } from "@/utils/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { UserPayloadIncluded } from "@/types/prisma";
import { Button } from "../ui/button";
import Link from "next/link";
import Loading from "../common/Loading";
import ServerError from "../common/ServerError";
import { type FC, useMemo, useState } from "react";
import { Label } from "../ui/label";
import { TableProps } from "@/pages/admin/[...path]";

import { useQueryState, parseAsStringEnum } from "next-usequerystate";

import { OmitUndefined } from "@/types/custom";
import TableHeader from "./TableHeader";

type SortBy = OmitUndefined<RouterInputs["user"]["getUsers"]["sortBy"]>;

const UserTable: FC<TableProps> = ({ search }) => {
  const [sortOrder, setSortOrder] = useQueryState<SortOrder>(
    "sortOrder",
    parseAsStringEnum(["asc", "desc"]).withDefault(DefaultSortOrder)
  );
  const [sortBy, setSortBy] = useQueryState<SortBy>(
    "sortBy",
    parseAsStringEnum([
      "role",
      "name",
      "createdAt",
      "updatedAt",
      "email",
      "lastActive",
    ]).withDefault(DefaultSortBy)
  );

  const rolesApi = api.role.getRoles.useQuery({});

  const [selectedRole, setSelectedRole] = useState<string>();
  const usersApi = api.user.getUsers.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      role: selectedRole,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const updateUserRole = api.user.updateUserRole.useMutation();

  const columns: ColumnDef<UserPayloadIncluded>[] = useMemo(
    () => [
      {
        id: "name",
        header: () => (
          <TableHeader
            title="name"
            sortOrder={sortOrder}
            setSortOrder={(order) => void setSortOrder(order)}
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
          />
        ),
        accessorFn: (row) => row.name,
      },
      {
        id: "email",
        header: () => (
          <TableHeader
            title="email"
            sortOrder={sortOrder}
            setSortOrder={(order) => void setSortOrder(order)}
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
          />
        ),
        accessorFn: (row) => row.email,
      },
      {
        id: "role",
        header: () => (
          <TableHeader
            title="role"
            sortOrder={sortOrder}
            setSortOrder={(order) => void setSortOrder(order)}
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
          />
        ),
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
        header: () => (
          <TableHeader
            title="lastActive"
            sortOrder={sortOrder}
            setSortOrder={(order) => void setSortOrder(order)}
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
          />
        ),
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
        header: () => (
          <TableHeader
            title="createdAt"
            sortOrder={sortOrder}
            setSortOrder={(order) => void setSortOrder(order)}
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
          />
        ),
        accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
      },
    ],
    [
      rolesApi.data,
      rolesApi.error,
      rolesApi.isError,
      rolesApi.isLoading,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
      updateUserRole,
      usersApi,
    ]
  );

  if (usersApi.isLoading || rolesApi.isLoading) {
    return <Loading />;
  }
  if (usersApi.isError || rolesApi.isError) {
    return (
      <ServerError
        message={
          usersApi.error?.message ??
          rolesApi.error?.message ??
          "Something went wrong"
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="ps-2 font-bold">Users</h1>
        <Label className="flex items-center gap-3">
          Filter
          <Select
            onValueChange={(value) => {
              setSelectedRole(value === "" ? undefined : value);
            }}
            value={selectedRole ?? ""}
          >
            <SelectTrigger className="w-[180px] capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Users</SelectItem>
              {rolesApi.data.map((role) => (
                <SelectItem
                  value={role.id}
                  key={role.id}
                  className="capitalize"
                >
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Label>
      </div>
      <DataTable
        columns={columns}
        data={usersApi.data.pages.flatMap((page) => page.users)}
        canViewMore={!!usersApi.hasNextPage}
        viewMore={() => {
          void usersApi.fetchNextPage();
        }}
      />
    </div>
  );
};

export default UserTable;
