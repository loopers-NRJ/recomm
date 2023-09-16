import { Pen, Trash } from "lucide-react";
import { FC } from "react";

import { TableProps } from "@/types/admin";
import { api } from "@/utils/api";
import { Brand } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";

export const columns: ColumnDef<Brand>[] = [
  {
    id: "Name",
    header: "Name",
    accessorFn: (row) => row.name,
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorFn: (row) => row.createdAt.toLocaleString(),
  },
  {
    id: "edit",
    header: "",
    accessorFn: (row) => row.id,
    cell: () => (
      <Button>
        <Pen />
      </Button>
    ),
  },
  {
    id: "delete",
    header: "",
    accessorFn: (row) => row.id,
    cell: () => (
      <Button variant="destructive">
        <Trash />
      </Button>
    ),
  },
];

const BrandTable: FC<TableProps> = () => {
  const { data, isLoading, isError, error } = api.brand.getBrands.useQuery({});
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    console.log(error);
    return <div>Something went wrong</div>;
  }
  if (data instanceof Error) {
    return <div>{data.message}</div>;
  }
  return <DataTable columns={columns} data={data} />;
};

export default BrandTable;
