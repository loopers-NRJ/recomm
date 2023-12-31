import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import { RouterInputs, api } from "@/utils/api";
import { DefaultSortBy, DefaultSortOrder, SortOrder } from "@/utils/constants";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../ui/button";
import { DataTable } from "./Table";
import { Switch } from "@/components/ui/switch";
import { CategoryPayloadIncluded } from "@/types/prisma";
import ServerError from "../common/ServerError";
import Loading from "../common/Loading";
import { TableProps } from "@/pages/admin/[...path]";
import TableHeader from "./TableHeader";
import { OmitUndefined } from "@/types/custom";
import { useAdminSelectedState } from "../../store/SelectedState";

import { useQueryState, parseAsStringEnum } from "next-usequerystate";

type SortBy = OmitUndefined<
  RouterInputs["category"]["getCategories"]["sortBy"]
>;

const CategoryTable: React.FC<TableProps> = ({ search }) => {
  const router = useRouter();
  const path = (router.query.path as ["brands", ...string[]]).slice(1);

  const parentId =
    path.length === 0 ? null : path[path.length - 1]!.split("=")[1] ?? null;

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "name",
      "createdAt",
      "updatedAt",
      "active",
      "featured",
    ]).withDefault(DefaultSortBy)
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault(DefaultSortOrder)
  );

  const selectedState = useAdminSelectedState((selected) => selected.state);

  const categoriesApi = api.category.getCategories.useInfiniteQuery(
    {
      parentId,
      search,
      sortBy,
      sortOrder,
      state: selectedState,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const parentCategoryApi = api.category.getCategoryById.useQuery({
    categoryId: parentId,
  });

  const deleteCategoryApi = api.category.deleteCategoryById.useMutation();
  const updateCategoryById = api.category.updateCategoryById.useMutation();
  const removeCategoryFeatured =
    api.category.removeCategoryFromFeaturedById.useMutation();
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
              href={`${router.asPath}/${row.original.slug}=${row.original.id}`}
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
              setUpdatingCategoryId(row.original.id);
              updateCategoryById
                .mutateAsync({
                  id: row.original.id,
                  active: !row.original.active,
                })
                .then(async () => {
                  await categoriesApi.refetch();
                  setUpdatingCategoryId(undefined);
                })
                .catch((err) => {
                  console.log(err);
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
              setFeaturedCategoryState(row.original.id);
              if (row.original.featuredCategory !== null) {
                removeCategoryFeatured
                  .mutateAsync({
                    categoryId: row.original.id,
                  })
                  .then(async () => {
                    await categoriesApi.refetch();
                    setFeaturedCategoryState("");
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else {
                void router.push(
                  `/admin/featured-category/create/?id=${row.original.id}`
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
        header: "",
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <Button variant="outline" size="sm" className="border-blue-400">
            <Link
              href={`/admin/category/edit/?id=${row.original.id}`}
              className="flex h-full w-full items-center justify-center"
            >
              Edit
            </Link>
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
                  setDeletingCategoryId(undefined);
                });
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
    ]
  );

  if (categoriesApi.isLoading || parentCategoryApi.isLoading) {
    return <Loading />;
  }

  if (categoriesApi.isError || parentCategoryApi.isError) {
    return (
      <ServerError
        message={
          categoriesApi.error?.message ?? parentCategoryApi.error?.message ?? ""
        }
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between rounded-lg">
        <div>
          <span className="px-2 font-bold">
            {parentId === null ? "All Categories" : "Sub Category of"}
          </span>
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

export default CategoryTable;
