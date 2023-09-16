import { Pen, Trash } from "lucide-react";
import { FC, useState } from "react";

import { TableProps } from "@/types/admin";
import { api } from "@/utils/api";
import { Brand } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";
import { CreateModel } from "./CreateModel";
import { EditModel } from "./EditModel";

const BrandTable: FC<TableProps> = ({
  createModelVisibility,
  setCreateModelVisibility,
}) => {
  const brandApi = api.brand.getBrands.useQuery({});
  const [brand, setBrand] = useState<Brand>();
  const deleteBrandApi = api.brand.deleteBrandById.useMutation();
  // this state is to disable the delete button when admin clicks on it
  const [deleteBrandId, setDeleteBrandId] = useState<string>();
  if (brandApi.isLoading) {
    return <div>Loading...</div>;
  }
  if (brandApi.isError) {
    console.log(brandApi.error);
    return <div>Something went wrong</div>;
  }
  if (brandApi.data instanceof Error) {
    return <div>{brandApi.data.message}</div>;
  }

  const columns: ColumnDef<Brand>[] = [
    {
      id: "Name",
      header: "Name",
      accessorFn: (row) => row.name,
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
    {
      id: "edit",
      header: "",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <Button onClick={() => setBrand(row.original)}>
          <Pen />
        </Button>
      ),
    },
    {
      id: "delete",
      header: "",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => {
            setDeleteBrandId(row.original.id);
            void deleteBrandApi
              .mutateAsync({
                brandId: row.original.id,
              })
              .then(async () => {
                await brandApi.refetch();
                setDeleteBrandId(undefined);
              });
          }}
          disabled={deleteBrandId === row.original.id}
        >
          <Trash />
        </Button>
      ),
    },
  ];

  return (
    <>
      <CreateModel
        createModelVisibility={createModelVisibility}
        setCreateModelVisibility={setCreateModelVisibility}
        onCreate={() => void brandApi.refetch()}
      />

      <EditModel
        brand={brand}
        setBrand={setBrand}
        onEdit={() => void brandApi.refetch()}
      />

      <DataTable columns={columns} data={brandApi.data} />
    </>
  );
};

export default BrandTable;
