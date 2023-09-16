import { Pen, Trash } from "lucide-react";
import { FC } from "react";

import { TableProps } from "@/types/admin";
import { api } from "@/utils/api";
import { Product } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";

export const columns: ColumnDef<Product>[] = [
  {
    id: "Name",
    header: "Name",
    accessorFn: (row) => row.title,
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
  },
  {
    id: "edit",
    header: "Edit",
    accessorFn: (row) => row.id,
    cell: () => (
      <Button>
        <Pen />
      </Button>
    ),
  },
  {
    id: "delete",
    header: "Delete",
    accessorFn: (row) => row.id,
    cell: () => (
      <Button variant="destructive">
        <Trash />
      </Button>
    ),
  },
];

const ProductTable: FC<TableProps> = () => {
  const { data, isLoading, isError, error } = api.product.getProducts.useQuery(
    {}
  );
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

export default ProductTable;
