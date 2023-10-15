import { Pen, Trash } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

import { api } from "@/utils/api";
import {
  DefaultLimit,
  DefaultSearch,
  DefaultSortBy,
  DefaultSortOrder,
  SortBy,
  SortOrder,
} from "@/utils/constants";
import { Category } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../ui/button";
import { DataTable } from "./Table";
import { Switch } from "@/components/ui/switch";

const CategoryTable = () => {
  const router = useRouter();
  const path = (router.query.path as ["brands", ...string[]]).slice(1);

  const parentId =
    path.length === 0 ? null : path[path.length - 1]!.split("=")[1] ?? null;

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const limit = +(params.get("limit") ?? DefaultLimit);

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;

  const categoriesApi = api.category.getCategories.useQuery({
    parentId,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  const parentCategoryApi = api.category.getCategoryById.useQuery({
    categoryId: parentId,
  });

  const deleteCategoryApi = api.category.deleteCategoryById.useMutation();
  const updateCategoryById = api.category.updateCategoryById.useMutation();
  const [updatingCategoryId, setUpdatingCategoryId] = useState("");
  // this state is to disable the delete button when the user clicks the delete button
  const [deletingCategoryId, setDeletingCategoryId] = useState("");

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
      id: "products",
      header: "Products",
      cell: ({ row }) => (
        <Link
          href={`/admin/products?category=${row.original.id}`}
          className="text-blue-400 hover:text-blue-600"
        >
          Products
        </Link>
      ),
    },
    {
      id: "brands",
      header: "Brands",
      cell: ({ row }) => (
        <Link
          href={`/admin/brands?category=${row.original.id}`}
          className="text-blue-400 hover:text-blue-600"
        >
          Brands
        </Link>
      ),
    },
    {
      id: "models",
      header: "Models",
      cell: ({ row }) => (
        <Link
          href={`/admin/models?category=${row.original.id}`}
          className="text-blue-400 hover:text-blue-600"
        >
          Models
        </Link>
      ),
    },
    {
      id: "active",
      header: "Active",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <Switch
          // onClick={() => {
          //   setEditableCategory(row.original);
          //   openModel();
          // }}

          // variant="ghost"
          // size="sm"
          disabled={updatingCategoryId === row.original.id}
          checked={row.original.active}
          onCheckedChange={() => {
            setUpdatingCategoryId(row.original.id);
            updateCategoryById
              .mutateAsync({
                id: row.original.id,
                active: !row.original.active,
              })
              .then(async () => {
                await categoriesApi.refetch();
                setUpdatingCategoryId("");
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        />
      ),
    },
    {
      id: "edit",
      header: "",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <Button
          onClick={() => {
            void router.push(`/admin/category/edit/?id=${row.original.id}`);
          }}
          variant="ghost"
          size="sm"
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
            setDeletingCategoryId(row.original.id);
            void deleteCategoryApi
              .mutateAsync({ categoryId: row.original.id })
              .then(async () => {
                await categoriesApi.refetch();
                setDeletingCategoryId("");
              });
          }}
          disabled={deletingCategoryId === row.original.id}
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
      <div className="flex items-center justify-between rounded-lg px-2 py-2">
        <div>
          <span className="px-2 font-bold">
            {parentId === null ? "All Categories" : "Sub Category of"}
          </span>
          {/* TODO: display the category image */}
          {parentCategoryApi.data?.name && ` - ${parentCategoryApi.data?.name}`}
        </div>
        <div>
          <Link
            href={`/admin/category/create${
              parentId
                ? `/?parentId=${parentId}&parentName=${parentCategoryApi.data?.name}`
                : ""
            }`}
          >
            <Button>New</Button>
          </Link>
        </div>
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
