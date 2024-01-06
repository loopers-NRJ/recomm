"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminSelectedState } from "@/store/SelectedState";
import { type OmitUndefined } from "@/types/custom";
import { type CategoryPayloadIncluded } from "@/types/prisma";
import {
  defaultSearch,
  defaultSortBy,
  defaultSortOrder,
  type SortOrder,
} from "@/utils/constants";
import { type ColumnDef } from "@tanstack/react-table";
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";
import Link from "next/link";
import {
  notFound,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useMemo, useState } from "react";
import Searchbar from "../Searchbar";
import TableHeader from "../TableHeader";
import { type RouterInputs } from "@/trpc/shared";
import { api } from "@/trpc/react";
import { ButtonLink } from "@/components/common/ButtonLink";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";

type SortBy = OmitUndefined<RouterInputs["category"]["all"]["sortBy"]>;

export default function CategoryTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const parentSlug = searchParams.get("parentSlug");
  const parentId = searchParams.get("parentId");

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "name",
      "createdAt",
      "updatedAt",
      "active",
      "featured",
    ]).withDefault(defaultSortBy),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault(defaultSortOrder),
  );

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(defaultSearch),
  );

  const selectedState = useAdminSelectedState((selected) => selected.state);

  const categoriesApi = api.category.all.useInfiniteQuery(
    {
      parentId,
      parentSlug,
      search,
      sortBy,
      sortOrder,
      state: selectedState,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const parentCategoryApi = api.category.byId.useQuery({
    categoryId: parentId,
  });

  const deleteCategoryApi = api.category.delete.useMutation({
    onMutate: (variables) => {
      setDeletingCategoryId(variables.categoryId);
    },
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void categoriesApi.refetch();
    },
    onError: errorHandler,
    onSettled: () => {
      setDeletingCategoryId(undefined);
    },
  });
  const updateCategoryById = api.category.update.useMutation({
    onMutate: (variables) => {
      setUpdatingCategoryId(variables.id);
    },
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void categoriesApi.refetch();
    },
    onError: errorHandler,
    onSettled: () => {
      setUpdatingCategoryId(undefined);
    },
  });
  const removeCategoryFeatured = api.category.removeFromFeatured.useMutation({
    onMutate: (variables) => {
      setFeaturedCategoryState(variables.categoryId);
    },
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void categoriesApi.refetch();
    },
    onError: (err) => {
      console.log(err);
    },
    onSettled: () => {
      setFeaturedCategoryState("");
    },
  });
  // this state is to disable the update button when the user clicks the update button
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string>();
  // this state is to disable the delete button when the user clicks the delete button
  const [deletingCategoryId, setDeletingCategoryId] = useState<string>();
  // this state is to disable the featured button when the user clicks the featured button
  const [featuredCategoryState, setFeaturedCategoryState] = useState("");

  const columns: ColumnDef<CategoryPayloadIncluded>[] = useMemo(
    () => [
      {
        id: "Name",
        header: () => (
          <TableHeader
            title="name"
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.name,
        cell: ({ row }) => {
          return (
            <Link
              href={`${pathname}/?parentId=${row.original.id}&parentName=${row.original.slug}`}
              className="text-blue-400 hover:text-blue-600"
            >
              {row.original.name}
            </Link>
          );
        },
      },
      {
        id: "active",
        header: () => (
          <TableHeader
            title="active"
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        cell: ({ row }) => (
          <Switch
            disabled={updatingCategoryId === row.original.id}
            checked={row.original.active}
            // make the switch blue when active and black when inactive
            className="data-[state=checked]:bg-blue-500"
            onCheckedChange={() => {
              updateCategoryById.mutate({
                id: row.original.id,
                active: !row.original.active,
              });
            }}
          />
        ),
      },
      {
        id: "is-Featured",
        header: () => (
          <TableHeader
            title="featured"
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        cell: ({ row }) => (
          <Switch
            disabled={featuredCategoryState === row.original.id}
            checked={row.original.featuredCategory !== null}
            className="data-[state=checked]:bg-yellow-500"
            onCheckedChange={() => {
              if (row.original.featuredCategory !== null) {
                removeCategoryFeatured.mutate({
                  categoryId: row.original.id,
                });
              } else {
                router.push(
                  `/admin/featured-category/create/${row.original.id}`,
                );
              }
            }}
          />
        ),
      },
      {
        id: "products",
        header: "Products",
        cell: ({ row }) => (
          <Link
            href={`/admin/tables/products?category=${row.original.id}`}
            className="text-blue-400 hover:text-blue-600"
          >
            Products
          </Link>
        ),
      },
      {
        id: "brands",
        header: "Brands",
        cell: ({ row }) =>
          row.original._count.subCategories === 0 ? (
            <Link
              href={`/admin/tables/brands?category=${row.original.id}`}
              className="text-blue-400 hover:text-blue-600"
            >
              Brands
            </Link>
          ) : (
            "N/A"
          ),
      },
      {
        id: "models",
        header: "Models",
        cell: ({ row }) => (
          <Link
            href={`/admin/tables/models?category=${row.original.id}`}
            className="text-blue-400 hover:text-blue-600"
          >
            Models
          </Link>
        ),
      },
      {
        id: "createdAt",
        header: () => (
          <TableHeader
            title="createdAt"
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
      },
      {
        id: "updatedAt",
        header: () => (
          <TableHeader
            title="updatedAt"
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.updatedAt.toLocaleString("en-US"),
      },
      {
        id: "edit",
        header: "Edit",
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <ButtonLink
            variant="outline"
            size="sm"
            className="border-blue-400"
            href={`/admin/category/edit/${row.original.id}`}
          >
            Edit
          </ButtonLink>
        ),
      },
      {
        id: "delete",
        header: "Delete",
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <Button
            onClick={() => {
              deleteCategoryApi.mutate({ categoryId: row.original.id });
            }}
            disabled={deletingCategoryId === row.original.id}
            size="sm"
            variant="outline"
            className="border-red-400"
          >
            Delete
          </Button>
        ),
      },
    ],
    [
      categoriesApi,
      deleteCategoryApi,
      deletingCategoryId,
      featuredCategoryState,
      removeCategoryFeatured,
      router,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
      updateCategoryById,
      updatingCategoryId,
    ],
  );

  if (categoriesApi.isError || parentCategoryApi.isError) {
    return (
      <ServerError
        message={
          categoriesApi.error?.message ?? parentCategoryApi.error?.message ?? ""
        }
      />
    );
  }
  if (parentCategoryApi.data === "Category not found") {
    return notFound();
  }

  return (
    <>
      <Searchbar search={search} setSearch={setSearch} />
      <div className="flex items-center justify-between rounded-lg">
        <div>
          <span className="px-2 font-bold">
            {!parentCategoryApi.data
              ? "All Categories"
              : `Sub Category of ${parentCategoryApi.data?.name}`}
          </span>
        </div>
        <div>
          <Link
            href={`/admin/category/create${
              parentCategoryApi.data
                ? `/?parentId=${parentCategoryApi.data.id}&parentName=${parentCategoryApi.data.name}`
                : ""
            }`}
          >
            <Button>New</Button>
          </Link>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={categoriesApi.data?.pages.flatMap((page) => page.categories)}
        canViewMore={!!categoriesApi.hasNextPage}
        viewMore={() => {
          void categoriesApi.fetchNextPage();
        }}
        isLoading={categoriesApi.isLoading || parentCategoryApi.isLoading}
      />
    </>
  );
}
