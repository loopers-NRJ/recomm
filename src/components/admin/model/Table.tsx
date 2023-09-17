import { Pen, Trash } from "lucide-react";

import { Model } from "@/types/prisma";
import { api } from "@/utils/api";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";
import { CreateModel } from "./CreateModel";

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
  const modelApi = api.model.getModels.useQuery({});
  if (modelApi.isLoading) {
    return <div>Loading...</div>;
  }
  if (modelApi.isError) {
    console.log(modelApi.error);
    return <div>Error</div>;
  }
  if (modelApi.data instanceof Error) {
    return <div>{modelApi.data.message}</div>;
  }
  return (
    <>
      <CreateModel onCreate={() => void modelApi.refetch()} />

      <DataTable columns={columns} data={modelApi.data} />
    </>
  );
};

export default ModelTable;
