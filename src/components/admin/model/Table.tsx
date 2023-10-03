import { Pen, Trash } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import useAdminModal from "@/hooks/useAdminModel";
import { Pagination } from "@/types/admin";
import { ModelPayloadIncluded } from "@/types/prisma";
import { api } from "@/utils/api";
import {
  DefaultLimit,
  DefaultPage,
  DefaultSearch,
  DefaultSortBy,
  DefaultSortOrder,
  SortBy,
  SortOrder,
} from "@/utils/constants";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";
import { CreateModel } from "./CreateModel";
import { EditModel } from "./EditModel";

const ModelTable = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const page = +(params.get("page") ?? DefaultPage);
  const limit = +(params.get("limit") ?? DefaultLimit);

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: page,
    pageSize: limit,
  });

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;
  const categoryId = params.get("category") ?? undefined;
  const brandId = params.get("brand") ?? undefined;

  const modelApi = api.model.getModels.useQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
    search,
    sortBy,
    sortOrder,
    categoryId,
    brandId,
  });

  const deleteModelApi = api.model.deleteModelById.useMutation();
  const [deleteModelId, setDeleteModelId] = useState<string>();
  const [editableModel, setEditableModel] = useState<ModelPayloadIncluded>();
  const { open: openModel } = useAdminModal();
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

  const columns: ColumnDef<ModelPayloadIncluded>[] = [
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
      // TODO: display the array of categories instead of first one
      accessorFn: (row) => row.categories[0]?.name,
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
      id: "products",
      header: "Products",
      cell: ({ row }) => (
        <Link
          href={`/admin/products?model=${row.original.id}`}
          className="text-blue-400 hover:text-blue-600"
        >
          Products
        </Link>
      ),
    },
    {
      id: "edit",
      header: "",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <Button
          onClick={() => {
            setEditableModel(row.original);
            openModel();
          }}
          size="sm"
          variant="ghost"
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
          onClick={() => {
            setDeleteModelId(row.id);
            void deleteModelApi
              .mutateAsync({ modelId: row.original.id })
              .then(async () => {
                await modelApi.refetch();
                setDeleteModelId(undefined);
              });
          }}
          disabled={deleteModelId === row.id}
          size="sm"
          variant="ghost"
        >
          <Trash color="red" />
        </Button>
      ),
    },
  ];

  return (
    <>
      {editableModel ? (
        <EditModel
          model={editableModel}
          setModel={setEditableModel}
          onEdit={() => void modelApi.refetch()}
        />
      ) : (
        <CreateModel onCreate={() => void modelApi.refetch()} />
      )}
      <DataTable
        columns={columns}
        data={modelApi.data.models}
        pageCount={modelApi.data.totalPages}
        pagination={pagination}
        setPagination={setPagination}
      />
    </>
  );
};

export default ModelTable;
