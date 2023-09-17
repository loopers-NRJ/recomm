import { Pen, Trash } from "lucide-react";
import { useState } from "react";

import useAdminModal from "@/hooks/useAdminModel";
import { Pagination } from "@/types/admin";
import { api } from "@/utils/api";
import { DefaultLimit } from "@/utils/validation";
import { Brand } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";
import { CreateModel } from "./CreateModel";
import { EditModel } from "./EditModel";

const BrandTable = () => {
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 1,
    pageSize: DefaultLimit,
  });

  const brandApi = api.brand.getBrands.useQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
  });

  const [editableBrand, setEditableBrand] = useState<Brand>();
  const deleteBrandApi = api.brand.deleteBrandById.useMutation();
  // this state is to disable the delete button when admin clicks on it
  const [deleteBrandId, setDeleteBrandId] = useState<string>();
  const { open: openModel } = useAdminModal();

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
        <Button
          onClick={() => {
            setEditableBrand(row.original);
            openModel();
          }}
        >
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
      {editableBrand ? (
        <EditModel
          brand={editableBrand}
          setBrand={setEditableBrand}
          onEdit={() => void brandApi.refetch()}
        />
      ) : (
        <CreateModel onCreate={() => void brandApi.refetch()} />
      )}

      <DataTable
        columns={columns}
        data={brandApi.data.brands}
        pageCount={brandApi.data.totalPages}
        pagination={pagination}
        setPagination={setPagination}
      />
    </>
  );
};

export default BrandTable;
