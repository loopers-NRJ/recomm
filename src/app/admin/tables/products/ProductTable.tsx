"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { useAdminselectedCity } from "@/store/AdminSelectedCity";
import { type OmitUndefined } from "@/types/custom";
import { type ProductsPayloadIncluded } from "@/types/prisma";
import { api } from "@/trpc/react";
import { type RouterInputs } from "@/trpc/shared";
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
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import AdminSearchbar from "../AdminSearchbar";
import TableHeader from "../TableHeader";
import { errorHandler } from "@/utils/errorHandler";
import { Switch } from "@/components/ui/switch";
import { AdminButtonLink } from "@/components/common/ButtonLink";

type SortBy = OmitUndefined<RouterInputs["product"]["all"]["sortBy"]>;

export default function ProductTable() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const updateProduct = api.product.update.useMutation({
    onSuccess: () => {
      void productApi.refetch();
    },
    onError: errorHandler,
  });

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "name",
      "createdAt",
      "updatedAt",
      "active",
      "price",
      "sellerName",
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

  const categoryId = params.get("category") ?? undefined;
  const brandId = params.get("brand") ?? undefined;
  const modelId = params.get("model") ?? undefined;

  const city = useAdminselectedCity((selected) => selected.city?.value);

  const productApi = api.product.all.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      modelId,
      categoryId,
      brandId,
      city,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => {
      void productApi.refetch();
    },
    onError: errorHandler,
  });

  const columns: ColumnDef<Omit<ProductsPayloadIncluded, "room">>[] = useMemo(
    () => [
      {
        id: "name",
        header: () => (
          <TableHeader
            title="name"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.title,
      },
      {
        id: "price",
        header: () => (
          <TableHeader
            title="price"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
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
              updateProduct.isLoading &&
              updateProduct.variables?.id === row.original.id
            }
            checked={row.original.active}
            className="data-[state=checked]:bg-blue-500"
            onCheckedChange={() => {
              updateProduct.mutate({
                id: row.original.id,
                active: !row.original.active,
              });
            }}
          />
        ),
      },
      {
        id: "seller",
        header: () => (
          <TableHeader
            title="sellerName"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.seller.name,
      },
      {
        id: "CategoryName",
        header: "Category",
        accessorFn: (row) => row.model.category.name,
      },
      {
        id: "ModelName",
        header: "Model",
        accessorFn: (row) => row.model.name,
      },
      {
        id: "BrandName",
        header: "Brand",
        accessorFn: (row) => row.model.brand.name,
      },
      {
        id: "report",
        header: "Reports",
        cell: ({ row }) => (
          <Link
            href={`/admin/tables/products/${row.original.id}/reports`}
            className="text-blue-400 hover:text-blue-600"
          >
            Reports
          </Link>
        ),
      },
      // {
      //   id: "category",
      //   header: "Category",
      //   cell: ({ row }) => (
      //     <Link
      //       href={`/admin/tables/category/${row.original.model.category.slug}=${row.original.model.category.id}`}
      //       className="text-blue-400 hover:text-blue-600"
      //     >
      //       Category
      //     </Link>
      //   ),
      // },
      // {
      //   id: "model",
      //   header: "Model",
      //   cell: ({ row }) => (
      //     <Link
      //       href={`/admin/tables/models/${row.original.model.id}`}
      //       className="text-blue-400 hover:text-blue-600"
      //     >
      //       Models
      //     </Link>
      //   ),
      // },
      // {
      //   id: "brand",
      //   header: "Brand",
      //   cell: ({ row }) => (
      //     <Link
      //       href={`/admin/tables/brands/${row.original.model.brand.id}`}
      //       className="text-blue-400 hover:text-blue-600"
      //     >
      //       Brands
      //     </Link>
      //   ),
      // },
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
        accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
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
        accessorFn: (row) => row.updatedAt.toLocaleString("en-US"),
      },
      {
        id: "delete",
        header: "Delete",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              deleteProduct.mutate({ productId: row.original.id });
            }}
            disabled={
              deleteProduct.isLoading &&
              deleteProduct.variables?.productId === row.original.id
            }
            className="border-red-400"
          >
            Delete
          </Button>
        ),
      },
    ],
    [deleteProduct, productApi, setSortBy, setSortOrder, sortBy, sortOrder],
  );

  if (productApi.isError) {
    return <ServerError message={productApi.error.message} />;
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <AdminSearchbar search={search} setSearch={setSearch} />
        <AdminButtonLink
          href="/api/generate/products"
          variant="outline"
          size="sm"
          className="border-blue-400"
        >
          EXPORT
        </AdminButtonLink>
      </div>

      <DataTable
        columns={columns}
        data={productApi.data?.pages.flatMap((page) => page.products)}
        canViewMore={!!productApi.hasNextPage}
        viewMore={() => {
          void productApi.fetchNextPage();
        }}
        isLoading={productApi.isLoading}
      />
    </div>
  );
}
