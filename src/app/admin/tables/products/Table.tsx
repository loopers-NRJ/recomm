"use client";

import { DataTable } from "@/app/admin/tables/Table";
import Loading from "@/components/common/Loading";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { useAdminSelectedState } from "@/store/SelectedState";
import { type OmitUndefined } from "@/types/custom";
import { type ProductsPayloadIncluded } from "@/types/prisma";
import { api } from "@/trpc/react";
import { type RouterInputs } from "@/trpc/shared";
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
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Searchbar from "../Searchbar";
import TableHeader from "../TableHeader";

type SortBy = OmitUndefined<RouterInputs["product"]["getProducts"]["sortBy"]>;

export default function ProductTable() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "name",
      "createdAt",
      "updatedAt",
      "active",
      "price",
      "sellerName",
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

  const categoryId = params.get("category") ?? undefined;
  const brandId = params.get("brand") ?? undefined;
  const modelId = params.get("model") ?? undefined;

  const selectedState = useAdminSelectedState((selected) => selected.state);

  const productApi = api.product.getProducts.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      modelId,
      categoryId,
      brandId,
      state: selectedState,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );
  const deleteProduct = api.product.deleteProductById.useMutation();
  const [deleteId, setDeleteId] = useState<string>();
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
        id: "category",
        header: "Category",
        cell: ({ row }) => (
          <Link
            href={`/admin/tables/category/${row.original.model.category.slug}=${row.original.model.category.id}`}
            className="text-blue-400 hover:text-blue-600"
          >
            {row.original.model.category.name}
          </Link>
        ),
      },
      {
        id: "model",
        header: "Model",
        cell: ({ row }) => (
          <Link
            href={`/admin/tables/models/${row.original.model.id}`}
            className="text-blue-400 hover:text-blue-600"
          >
            {row.original.model.name}
          </Link>
        ),
      },
      {
        id: "brand",
        header: "Brand",
        cell: ({ row }) => (
          <Link
            href={`/admin/tables/brands/${row.original.model.brand.id}`}
            className="text-blue-400 hover:text-blue-600"
          >
            {row.original.model.brand.name}
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
              setDeleteId(row.original.id);
              void deleteProduct
                .mutateAsync({ productId: row.original.id })
                .then(async () => {
                  await productApi.refetch();
                  setDeleteId(undefined);
                });
            }}
            disabled={deleteId === row.original.id}
            className="border-red-400"
          >
            Delete
          </Button>
        ),
      },
    ],
    [
      deleteId,
      deleteProduct,
      productApi,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
    ],
  );

  if (productApi.isLoading) {
    return <Loading />;
  }
  if (productApi.isError) {
    return <ServerError message={productApi.error.message} />;
  }
  return (
    <>
      <Searchbar search={search} setSearch={setSearch} />
      <DataTable
        columns={columns}
        data={productApi.data.pages.flatMap((page) => page.products)}
        canViewMore={!!productApi.hasNextPage}
        viewMore={() => {
          void productApi.fetchNextPage();
        }}
      />
    </>
  );
}
