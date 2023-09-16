import { Pen, Trash } from "lucide-react";

import { Model } from "@/types/prisma";
import { api } from "@/utils/api";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";

export const columns: ColumnDef<Model>[] = [
  {
    id: "Name",
    header: "Name",
    accessorFn: (row) => row.name,
  },
  {
    id: "Brand",
    header: "Brand",
    accessorFn: (row) => row.brand.name,
  },
  {
    id: "Category",
    header: "Category",
    accessorFn: (row) => row.category.name,
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
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

const ModelTable = () => {
  const { data, isLoading, isError, error } = api.model.getModels.useQuery({});
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (isError) {
    console.log(error);
    return <div>Error</div>;
  }
  if (data instanceof Error) {
    return <div>{data.message}</div>;
  }
  return <DataTable columns={columns} data={data} />;
};

export default ModelTable;
