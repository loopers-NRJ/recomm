"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { type RolePayloadIncluded } from "@/types/prisma";
import { api } from "@/trpc/react";
import { defaultSearch, defaultSortOrder } from "@/utils/constants";
import { type ColumnDef } from "@tanstack/react-table";
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Searchbar from "../Searchbar";
import TableHeader from "../TableHeader";

export default function RoleTable() {
  const router = useRouter();

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum(["asc", "desc"]).withDefault(defaultSortOrder),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(defaultSearch),
  );
  const rolesApi = api.role.getRoles.useQuery({
    search,
    sortOrder,
  });
  const [deletingRoleId, setDeletingRoleId] = useState<string>();
  const deleteRoleApi = api.role.deleteRole.useMutation();
  const columns: ColumnDef<RolePayloadIncluded>[] = useMemo(
    () => [
      {
        id: "name",
        header: () => (
          <TableHeader
            title="name"
            sortOrder={sortOrder}
            setSortOrder={(order) => void setSortOrder(order)}
            sortBy="name"
            setSortBy={() => {
              // do nothing
            }}
          />
        ),
        accessorFn: (row) => row.name,
      },
      {
        id: "accesses",
        header: "Accesses",
        cell: ({ row: { original: role } }) => {
          return (
            <Button
              variant="ghost"
              className="border"
              onClick={() => {
                router.push(`/admin/tables/roles/${role.id}`);
              }}
            >
              {role.accesses.length} Accesses
            </Button>
          );
        },
      },
      {
        id: "delete",
        header: "",
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <Button
            onClick={() => {
              setDeletingRoleId(row.original.id);
              void deleteRoleApi
                .mutateAsync({ id: row.original.id })
                .then(async () => {
                  await rolesApi.refetch();
                  setDeletingRoleId("");
                });
            }}
            disabled={deletingRoleId === row.original.id}
            size="sm"
            variant="outline"
            className="border-red-400"
          >
            Delete
          </Button>
        ),
      },
    ],
    [deleteRoleApi, deletingRoleId, rolesApi, router, setSortOrder, sortOrder],
  );

  if (rolesApi.isError) {
    return <ServerError message={rolesApi.error.message} />;
  }
  return (
    <>
      <div className="flex items-center justify-between rounded-lg">
        <Searchbar search={search} setSearch={setSearch} />
        <Link href="/admin/roles/create">
          <Button>New</Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={rolesApi.data}
        isLoading={rolesApi.isLoading}
      />
    </>
  );
}
