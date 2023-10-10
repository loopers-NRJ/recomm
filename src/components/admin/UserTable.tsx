import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Pagination } from "@/types/admin";
import { api } from "@/utils/api";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./Table";
import {
  DefaultPage,
  DefaultLimit,
  DefaultSearch,
  SortBy,
  DefaultSortBy,
  SortOrder,
  DefaultSortOrder,
} from "@/utils/constants";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";
import { UserPayloadIncluded } from "@/types/prisma";
import { AccessType } from "@prisma/client";

const UserTable = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const page = +(params.get("page") ?? DefaultPage);
  const limit = +(params.get("limit") ?? DefaultLimit);

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: page,
    pageSize: limit,
  });

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;

  const productApi = api.user.getUsers.useQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
    search,
    sortBy,
    sortOrder,
  });

  const rolesApi = api.search.role.useQuery();

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
        if (rolesApi.isError || rolesApi.data instanceof Error) {
          console.log(rolesApi.error);
          return <div>Error</div>;
        }
        return (
          <Select
            defaultValue={user.role?.name ?? "User"}
            disabled={user.role?.accesses
              .map((role) => role.type)
              .includes(AccessType.updateRole)}
          >
            <SelectTrigger className="w-[180px]">
              {user.role?.name ?? "User"}
            </SelectTrigger>
            <SelectContent>
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
      header: "last Active",
      accessorFn: (row) => row.lastActive?.toLocaleString("en-US") ?? "N/A",
    },
    {
      id: "createdAt",
      header: "Created At",
      accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
    },
    {
      id: "updatedAt",
      header: "Updated At",
      accessorFn: (row) => row.updatedAt.toLocaleString("en-US"),
    },
  ];

  if (productApi.isLoading) {
    return <div>Loading...</div>;
  }
  if (productApi.isError) {
    console.log(productApi.error);
    return <div>Error</div>;
  }
  if (productApi.data instanceof Error) {
    return <div>{productApi.data.message}</div>;
  }
  return (
    <DataTable
      columns={columns}
      data={productApi.data.users}
      pageCount={productApi.data.totalPages}
      pagination={pagination}
      setPagination={setPagination}
    />
  );
};

export default UserTable;
