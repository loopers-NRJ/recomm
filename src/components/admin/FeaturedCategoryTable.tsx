import Link from "next/link";
import { RouterInputs, api } from "@/utils/api";
import { DefaultSortBy, DefaultSortOrder, SortOrder } from "@/utils/constants";
import { ColumnDef } from "@tanstack/react-table";

import { DataTable } from "./Table";
import { type FC, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { FeaturedCategoryPayloadIncluded } from "@/types/prisma";
import ServerError from "../common/ServerError";
import Loading from "../common/Loading";
import { TableProps } from "@/pages/admin/[...path]";
import useUrl from "@/hooks/useUrl";
import { OmitUndefined } from "@/types/custom";
import TableHeader from "./TableHeader";

type SortBy = OmitUndefined<
  RouterInputs["category"]["getFeaturedCategories"]["sortBy"]
>;

const FeaturedCategoryTable: FC<TableProps> = ({ search }) => {
  const [sortBy, setSortBy] = useUrl<SortBy>("sortBy", DefaultSortBy);
  const [sortOrder, setSortOrder] = useUrl<SortOrder>(
    "sortOrder",
    DefaultSortOrder
  );

  const categoriesApi = api.category.getFeaturedCategories.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const removeCategoryFeatured =
    api.category.removeCategoryFromFeaturedById.useMutation();
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
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
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
        id: "createdAt",
        header: () => (
          <TableHeader
            title="createdAt"
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
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
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        ),
        accessorFn: (row) => row.category.updatedAt.toLocaleString("en-US"),
      },
      {
        id: "edit",
        header: "Edit",
        cell: ({ row }) => (
          <Button size="sm" variant="outline" className="border-blue-400">
            <Link
              href={`/admin/featured-category/edit/?id=${row.original.categoryId}`}
              className="flex h-full w-full items-center justify-center"
            >
              Edit
            </Link>
          </Button>
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
    ],
    [
      categoriesApi,
      featuredCategoryState,
      removeCategoryFeatured,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
    ]
  );

  if (categoriesApi.isLoading) {
    return <Loading />;
  }
  if (categoriesApi.isError) {
    return <ServerError message={categoriesApi.error.message} />;
  }

  return (
    <>
      <div className="flex items-center justify-between rounded-lg">
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
  );
};

export default FeaturedCategoryTable;
