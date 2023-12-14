import { api } from "@/utils/api";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./Table";
import { RolePayloadIncluded } from "@/types/prisma";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import { type FC, useMemo, useState } from "react";
import Loading from "../common/Loading";
import ServerError from "../common/ServerError";
import { DefaultSortOrder, SortOrder } from "@/utils/constants";
import { useSearchParams } from "next/navigation";
import { TableProps } from "@/pages/admin/[...path]";

const RoleTable: FC<TableProps> = ({ search }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;

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
        header: "Name",
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
                void router.push(`/admin/role/${role.id}`);
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
    [deleteRoleApi, deletingRoleId, rolesApi, router]
  );

  if (rolesApi.isLoading) {
    return <Loading />;
  }
  if (rolesApi.isError) {
    return <ServerError message={rolesApi.error.message} />;
  }
  return (
    <>
      <div className="flex items-center justify-between rounded-lg">
        <span className="px-2 font-bold">Roles</span>
        <Link href="/admin/role/create">
          <Button>New</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={rolesApi.data} />
    </>
  );
  return;
};

export default RoleTable;
