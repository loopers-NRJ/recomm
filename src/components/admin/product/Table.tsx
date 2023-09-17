import { Trash } from "lucide-react";
import { useState } from "react";

import { Product } from "@/types/prisma";
import { api } from "@/utils/api";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";

const ProductTable = () => {
  const productApi = api.product.getProducts.useQuery({});
  const deleteProduct = api.product.deleteProductById.useMutation();
  const [deleteId, setDeleteId] = useState<string>();
  const columns: ColumnDef<Omit<Product, "room">>[] = [
    {
      id: "name",
      header: "Name",
      accessorFn: (row) => row.title,
    },
    {
      id: "price",
      header: "Price",
      accessorFn: (row) => row.price,
    },
    {
      id: "brand",
      header: "Brand",
      accessorFn: (row) => row.model.brand.name,
    },
    {
      id: "model",
      header: "Model",
      accessorFn: (row) => row.model.name,
    },
    {
      id: "seller",
      header: "Seller name",
      accessorFn: (row) => row.seller.name,
    },
    {
      id: "createdAt",
      header: "Created At",
      accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
    },
    {
      id: "delete",
      header: "Delete",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => {
            setDeleteId(row.original.id);
            void deleteProduct
              .mutateAsync({ productId: row.original.id })
              .then(async () => {
                await productApi.refetch();
                setDeleteId(undefined);
              });
          }}
          disabled={deleteId === row.original.id}
        >
          <Trash />
        </Button>
      ),
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
  return <DataTable columns={columns} data={productApi.data} />;
};

export default ProductTable;
