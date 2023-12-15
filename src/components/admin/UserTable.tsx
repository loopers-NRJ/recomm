import { RouterInputs, api } from "@/utils/api";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./Table";
import { SortOrder, DefaultSortOrder } from "@/utils/constants";
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
import { ArrowDown, ArrowUp } from "lucide-react";
import useUrl from "@/hooks/useUrl";
import type { OmitUndefined } from "class-variance-authority/dist/types";

const UserTable: FC<TableProps> = ({ search }) => {
  const [sortBy, setSortBy] = useUrl<
    OmitUndefined<RouterInputs["user"]["getUsers"]["sortBy"]>
  >("sortBy", "name");
  const [sortOrder, setSortOrder] = useUrl<SortOrder>(
    "sortOrder",
    DefaultSortOrder
  );
  const rolesApi = api.search.role.useQuery();

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
          <Button
            className="flex items-center gap-0"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy !== "name") {
                return setSortBy("name");
              }
              if (sortOrder === "asc") {
                setSortOrder("desc");
              } else {
                setSortOrder("asc");
              }
            }}
          >
            Name
            {sortBy === "name" &&
              (sortOrder === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              ))}
          </Button>
        ),
        accessorFn: (row) => row.name,
      },
      {
        id: "email",
        header: () => (
          <Button
            className="flex items-center gap-0"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy !== "email") {
                return setSortBy("email");
              }
              if (sortOrder === "asc") {
                setSortOrder("desc");
              } else {
                setSortOrder("asc");
              }
            }}
          >
            Email
            {sortBy === "email" &&
              (sortOrder === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              ))}
          </Button>
        ),
        accessorFn: (row) => row.email,
      },
      {
        id: "role",
        header: () => (
          <Button
            className="flex items-center gap-0"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy !== "role") {
                return setSortBy("role");
              }
              if (sortOrder === "asc") {
                setSortOrder("desc");
              } else {
                setSortOrder("asc");
              }
            }}
          >
            Role
            {sortBy === "role" &&
              (sortOrder === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              ))}
          </Button>
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
          <Button
            className="flex items-center gap-0"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy !== "lastActive") {
                return setSortBy("lastActive");
              }
              if (sortOrder === "asc") {
                setSortOrder("desc");
              } else {
                setSortOrder("asc");
              }
            }}
          >
            Last Active
            {sortBy === "lastActive" &&
              (sortOrder === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              ))}
          </Button>
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
          <Button
            className="flex items-center gap-0"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (sortBy !== "createdAt") {
                return setSortBy("createdAt");
              }
              if (sortOrder === "asc") {
                setSortOrder("desc");
              } else {
                setSortOrder("asc");
              }
            }}
          >
            Created At
            {sortBy === "createdAt" &&
              (sortOrder === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : (
                <ArrowDown className="ml-2 h-4 w-4" />
              ))}
          </Button>
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
