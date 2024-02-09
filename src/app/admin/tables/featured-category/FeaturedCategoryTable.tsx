"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { useAdminSelectedState } from "@/store/SelectedState";
import type { OmitUndefined } from "@/types/custom";
import type { FeaturedCategoryPayloadIncluded } from "@/types/prisma";

import { api } from "@/trpc/react";
import { type RouterInputs } from "@/trpc/shared";
import {
  defaultSearch,
  defaultSortBy,
  defaultSortOrder,
  type SortOrder,
} from "@/utils/constants";
import type { ColumnDef } from "@tanstack/react-table";
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";
import Link from "next/link";
import { useMemo, useState } from "react";
import Searchbar from "../Searchbar";
import TableHeader from "../TableHeader";
import { AdminButtonLink } from "@/components/common/ButtonLink";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";

type SortBy = OmitUndefined<RouterInputs["category"]["featured"]["sortBy"]>;

export default function FeaturedCategoryTable() {
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "name",
      "createdAt",
      "updatedAt",
      "active",
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
  const categoriesApi = api.category.featured.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      state: selectedState,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
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
    onError: errorHandler,
    onSettled: () => {
      setFeaturedCategoryState("");
    },
  });
  // this state is to disable the featured button when the user clicks the featured button
  const [featuredCategoryState, setFeaturedCategoryState] = useState("");

  const columns: ColumnDef<FeaturedCategoryPayloadIncluded>[] = useMemo(
    () => [
      {
        id: "Name",
        header: () => (
          <TableHeader
            title="name"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.category.name,
        cell: ({ row }) => {
          return row.original.category.name;
        },
      },
      {
        id: "products",
        header: "Products",
        cell: ({ row }) => (
          <Link
            href={`/admin/tables/products?category=${row.original.categoryId}`}
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
            href={`/admin/tables/brands?category=${row.original.categoryId}`}
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
            href={`/admin/tables/models?category=${row.original.categoryId}`}
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
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.category.createdAt.toLocaleString("en-US"),
      },
      {
        id: "updatedAt",
        header: () => (
          <TableHeader
            title="updatedAt"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.category.updatedAt.toLocaleString("en-US"),
      },
      {
        id: "edit",
        header: "Edit",
        cell: ({ row }) => (
          <AdminButtonLink
            size="sm"
            variant="outline"
            className="border-blue-400"
            href={`/admin/featured-category/edit/${row.original.categoryId}`}
          >
            Edit
          </AdminButtonLink>
        ),
      },
      {
        id: "delete",
        header: "Delete",
        cell: ({ row }) => (
          <Button
            disabled={featuredCategoryState === row.original.categoryId}
            variant="outline"
            size="sm"
            className="border-red-400"
            onClick={() => {
              removeCategoryFeatured.mutate({
                categoryId: row.original.categoryId,
              });
            }}
          >
            Remove
          </Button>
        ),
      },
    ],
    [
      categoriesApi,
      featuredCategoryState,
      removeCategoryFeatured,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
    ],
  );

  if (categoriesApi.isError) {
    return <ServerError message={categoriesApi.error.message} />;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 rounded-lg">
        <Searchbar search={search} setSearch={setSearch} />
        <Link href="/admin/featured-category/create">
          <Button>New</Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={categoriesApi.data?.pages.flatMap((page) => page.categories)}
        canViewMore={!!categoriesApi.hasNextPage}
        viewMore={() => {
          void categoriesApi.fetchNextPage();
        }}
        isLoading={categoriesApi.isLoading}
      />
    </>
  );
}
