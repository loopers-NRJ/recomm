import { Pen, Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FC, useState } from "react";

import useAdminModal from "@/hooks/useAdminModel";
import { api } from "@/utils/api";
import { Category } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";
import { CreateModel } from "./CreateModel";
import { EditModel } from "./EditModel";

export interface CategoryTableProps {
  path: string[];
}

const CategoryTable: FC<CategoryTableProps> = ({ path }) => {
  const parentId = (path[path.length - 1]?.split("=") ??
    ([null, null] as const))[1];

  const categoriesApi = api.category.getCategories.useQuery({ parentId });

  const parentCategoryApi = api.category.getCategoryByIdOrNull.useQuery({
    categoryId: parentId,
  });

  const deleteCategoryApi = api.category.deleteCategoryById.useMutation();
  // this state is to disable the delete button when the user clicks the delete button
  const [deleteCategoryId, setDeleteCategoryId] = useState("");

  const [editableCategory, setEditableCategory] = useState<Category>();
  const { open: openModel } = useAdminModal();
  const router = useRouter();

  if (categoriesApi.isError) {
    console.log(categoriesApi.error);
    return <div>Something went wrong</div>;
  }
  if (deleteCategoryApi.isError) {
    console.log(deleteCategoryApi.error);
    return <div>Something went wrong</div>;
  }
  if (categoriesApi.data instanceof Error) {
    return <div>{categoriesApi.data.message}</div>;
  }
  if (parentCategoryApi.data instanceof Error) {
    return <div>{parentCategoryApi.data.message}</div>;
  }

  const columns: ColumnDef<Category>[] = [
    {
      id: "Name",
      header: "Name",
      accessorFn: (row) => row.name,
      cell: ({ row }) => {
        return (
          <Link
            href={`${router.asPath}/${row.original.slug}=${row.original.id}`}
            className="text-blue-400 hover:text-blue-600"
          >
            {row.original.name}
          </Link>
        );
      },
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
            setEditableCategory(row.original);
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
            setDeleteCategoryId(row.original.id);
            void deleteCategoryApi
              .mutateAsync({ categoryId: row.original.id })
              .then(async () => {
                await categoriesApi.refetch();
                setDeleteCategoryId("");
              });
          }}
          disabled={deleteCategoryId === row.original.id}
        >
          <Trash />
        </Button>
      ),
    },
  ];

  return (
    <>
      {editableCategory ? (
        <EditModel
          category={editableCategory}
          setCategory={setEditableCategory}
          onEdit={() => void categoriesApi.refetch()}
        />
      ) : (
        <CreateModel
          onCreate={() => void categoriesApi.refetch()}
          parentId={parentId}
          parentName={parentCategoryApi.data?.name}
        />
      )}

      <div className="flex items-center justify-between rounded-lg border px-2 py-2">
        <span className="px-2 font-bold">Category</span>{" "}
        {parentCategoryApi.data?.name ?? ""}
      </div>
      {categoriesApi.isLoading ? (
        <div className="flex justify-center">Loading...</div>
      ) : (
        <DataTable columns={columns} data={categoriesApi.data.categories} />
      )}
    </>
  );
};

export default CategoryTable;