import { api } from "@/utils/api";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./Table";
import { RolePayloadIncluded } from "@/types/prisma";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo } from "react";
import Loading from "../common/Loading";
import ServerError from "../common/ServerError";

const RoleTable = () => {
  const rolesApi = api.role.getRoles.useQuery();
  const router = useRouter();
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
    ],
    [router]
  );

  if (rolesApi.isLoading) {
    return <Loading />;
  }
  if (rolesApi.isError) {
    return <ServerError message={rolesApi.error.message} />;
  }
  return (
    <>
      <div className="flex items-center justify-between rounded-lg px-2 py-2">
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
