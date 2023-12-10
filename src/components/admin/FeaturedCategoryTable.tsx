import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { api } from "@/utils/api";
import {
  DefaultLimit,
  DefaultSearch,
  DefaultSortBy,
  DefaultSortOrder,
  SortBy,
  SortOrder,
} from "@/utils/constants";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./Table";
import { useState } from "react";
import { Button } from "../ui/button";
import { FeaturedCategoryPayloadIncluded } from "@/types/prisma";

const FeaturedCategoryTable = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const limit = +(params.get("limit") ?? DefaultLimit);

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;

  const categoriesApi = api.category.getFeaturedCategories.useInfiniteQuery(
    {
      limit,
      search,
      sortBy,
      sortOrder,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    }
  );
  const removeCategoryFeatured =
    api.category.removeCategoryFromFeaturedById.useMutation();
  // this state is to disable the featured button when the user clicks the featured button
  const [featuredCategoryState, setFeaturedCategoryState] = useState("");

  if (categoriesApi.isError) {
    console.log(categoriesApi.error);
    return <div>Something went wrong</div>;
  }

  const columns: ColumnDef<FeaturedCategoryPayloadIncluded>[] = [
    {
      id: "Name",
      header: "Name",
      accessorFn: (row) => row.category.name,
      cell: ({ row }) => {
        return row.original.category.name;
      },
    },
    {
      id: "createdAt",
      header: "Created At",
      accessorFn: (row) => row.category.createdAt.toLocaleString("en-US"),
    },
    {
      id: "updatedAt",
      header: "Updated At",
      accessorFn: (row) => row.category.updatedAt.toLocaleString("en-US"),
    },
    {
      id: "products",
      header: "Products",
      cell: ({ row }) => (
        <Link
          href={`/admin/products?category=${row.original.categoryId}`}
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
          href={`/admin/brands?category=${row.original.categoryId}`}
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
          href={`/admin/models?category=${row.original.categoryId}`}
          className="text-blue-400 hover:text-blue-600"
        >
          Models
        </Link>
      ),
    },
    {
      id: "is-Featured",
      header: "Featured",
      cell: ({ row }) => (
        <Button
          disabled={featuredCategoryState === row.original.categoryId}
          variant="outline"
          size="sm"
          className="border-red-400"
          onClick={() => {
            setFeaturedCategoryState(row.original.categoryId);
            removeCategoryFeatured
              .mutateAsync({
                categoryId: row.original.categoryId,
              })
              .then(async () => {
                await categoriesApi.refetch();
                setFeaturedCategoryState("");
              })
              .catch((err) => {
                console.log(err);
              });
          }}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <>
      {categoriesApi.isLoading ? (
        <div className="flex justify-center">Loading...</div>
      ) : (
        <>
          <div className="flex items-center justify-between rounded-lg px-2 py-2">
            <div>
              <span className="px-2 font-bold">Featured Categories</span>
            </div>
            <Link href="/admin/featured-category/create">
              <Button>New</Button>
            </Link>
          </div>
          <DataTable
            columns={columns}
            data={categoriesApi.data.pages.flatMap((page) => page.categories)}
            canViewMore={!!categoriesApi.hasNextPage}
            viewMore={() => {
              void categoriesApi.fetchNextPage();
            }}
          />
        </>
      )}
    </>
  );
};

export default FeaturedCategoryTable;
