import { Pen, Trash } from "lucide-react";
import { useState } from "react";

import useAdminModal from "@/hooks/useAdminModel";
import { Pagination } from "@/types/admin";
import { Model } from "@/types/prisma";
import { api } from "@/utils/api";
import { DefaultLimit } from "@/utils/validation";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";
import { CreateModel } from "./CreateModel";
import { EditModel } from "./EditModel";

const ModelTable = () => {
  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: 1,
    pageSize: DefaultLimit,
  });

  const modelApi = api.model.getModels.useQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
  });

  const deleteModelApi = api.model.deleteModelById.useMutation();
  const [deleteModelId, setDeleteModelId] = useState<string>();
  const [editableModel, setEditableModel] = useState<Model>();
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

  const columns: ColumnDef<Model>[] = [
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
            setEditableModel(row.original);
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
            setDeleteModelId(row.id);
            void deleteModelApi
              .mutateAsync({ modelId: row.original.id })
              .then(async () => {
                await modelApi.refetch();
                setDeleteModelId(undefined);
              });
          }}
          disabled={deleteModelId === row.id}
        >
          <Trash />
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
