"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminselectedCity } from "@/store/AdminSelectedCity";
import { type OmitUndefined } from "@/types/custom";
import { type CategoryPayloadIncluded } from "@/types/prisma";
import {
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
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
import { useMemo } from "react";
import AdminSearchbar from "../AdminSearchbar";
import TableHeader from "../TableHeader";
import { type RouterInputs } from "@/trpc/shared";
import { api } from "@/trpc/react";
import { AdminButtonLink } from "@/components/common/ButtonLink";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";

type SortBy = OmitUndefined<RouterInputs["category"]["allForAdmin"]["sortBy"]>;

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
    ]).withDefault(DEFAULT_SORT_BY),
  );
  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault(
      DEFAULT_SORT_ORDER,
    ),
  );

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const city = useAdminselectedCity((selected) => selected.city?.value);

  const categoriesApi = api.category.allForAdmin.useInfiniteQuery(
    {
      parentId,
      parentSlug,
      search,
      sortBy,
      sortOrder,
      city: city ?? "",
    },
    {
      enabled: city !== undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const parentCategoryApi = api.category.byId.useQuery({
    categoryId: parentId,
  });

  const createCategoryApi = api.category.create.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      toast.success("Category copied successfully");
      void categoriesApi.refetch();
    },
    onError: errorHandler,
  });

  const deleteCategoryApi = api.category.delete.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void categoriesApi.refetch();
    },
    onError: errorHandler,
  });
  const updateCategoryById = api.category.update.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void categoriesApi.refetch();
    },
    onError: errorHandler,
  });
  const removeCategoryFeatured = api.category.removeFromFeatured.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void categoriesApi.refetch();
    },
    onError: (err) => {
      console.log(err);
    },
  });

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
        id: "Price",
        header: () => (
          <TableHeader
            title="price"
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.price,
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
            disabled={
              updateCategoryById.isLoading &&
              updateCategoryById.variables?.id === row.original.id
            }
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
            disabled={
              removeCategoryFeatured.isLoading &&
              removeCategoryFeatured.variables?.categoryId === row.original.id
            }
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
        id: "coupons",
        header: "Coupons",
        cell: ({ row }) =>
          row.original._count.subCategories === 0 ? (
            <Link
              href={`/admin/tables/category/${row.original.id}/coupons`}
              className="text-blue-400 hover:text-blue-600"
            >
              Coupons
            </Link>
          ) : (
            "N/A"
          ),
      },
      {
        id: "products",
        header: "Products",
        cell: ({ row }) =>
          row.original._count.subCategories === 0 ? (
            <Link
              href={`/admin/tables/products?category=${row.original.id}`}
              className="text-blue-400 hover:text-blue-600"
            >
              Products
            </Link>
          ) : (
            "N/A"
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
        cell: ({ row }) =>
          row.original._count.subCategories === 0 ? (
            <Link
              href={`/admin/tables/models?category=${row.original.id}`}
              className="text-blue-400 hover:text-blue-600"
            >
              Models
            </Link>
          ) : (
            "N/A"
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
        id: "createdBy",
        header: () => (
          <TableHeader
            title="createdBy"
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.createdBy.name,
      },
      {
        id: "updatedBy",
        header: () => (
          <TableHeader
            title="updatedBy"
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.updatedBy?.name ?? "N/A",
      },
      {
        id: "copy",
        header: "Copy",
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="border-blue-400"
            onClick={() => {
              createCategoryApi.mutate({
                name: row.original.name + " copy",
                price: row.original.price,
                city: row.original.cityValue,
                parentCategoryId: row.original.parentCategoryId ?? undefined,
              });
            }}
            disabled={
              createCategoryApi.isLoading &&
              createCategoryApi.variables?.name === row.original.name + " copy"
            }
          >
            Copy
          </Button>
        ),
      },
      {
        id: "edit",
        header: "Edit",
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <AdminButtonLink
            variant="outline"
            size="sm"
            className="border-blue-400"
            href={`/admin/category/edit/${row.original.id}`}
          >
            Edit
          </AdminButtonLink>
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
            disabled={
              deleteCategoryApi.isLoading &&
              deleteCategoryApi.variables?.categoryId === row.original.id
            }
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
      removeCategoryFeatured,
      router,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
      updateCategoryById,
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
      <AdminSearchbar search={search} setSearch={setSearch} />
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
