import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ProductsPayloadIncluded } from "@/types/prisma";
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

import { Button } from "../ui/button";
import { DataTable } from "./Table";
import Loading from "../common/Loading";
import ServerError from "../common/ServerError";

const ProductTable = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const limit = +(params.get("limit") ?? DefaultLimit);

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;
  const categoryId = params.get("category") ?? undefined;
  const brandId = params.get("brand") ?? undefined;
  const modelId = params.get("model") ?? undefined;

  const productApi = api.product.getProducts.useInfiniteQuery(
    {
      limit,
      search,
      sortBy,
      sortOrder,
      modelId,
      categoryId,
      brandId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const deleteProduct = api.product.deleteProductById.useMutation();
  const [deleteId, setDeleteId] = useState<string>();
  const columns: ColumnDef<Omit<ProductsPayloadIncluded, "room">>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        accessorFn: (row) => row.title,
      },
      {
        id: "price",
        header: "Price",
        accessorFn: (row) => row.price,
      },
      {
        id: "category",
        header: "Cateegory",
        cell: ({ row }) => (
          <Link
            href={`/admin/category/${row.original.model.categories[0]?.slug}=${row.original.model.categories[0]?.id}`}
            className="text-blue-400 hover:text-blue-600"
          >
            {row.original.model.categories[0]?.name}
          </Link>
        ),
      },
      {
        id: "model",
        header: "Model",
        cell: ({ row }) => (
          <Link
            href={`/admin/models/${row.original.model.id}`}
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
            href={`/admin/brands/${row.original.model.brand.id}`}
            className="text-blue-400 hover:text-blue-600"
          >
            {row.original.model.brand.name}
          </Link>
        ),
      },
      {
        id: "seller",
        header: "Seller name",
        cell: ({ row }) =>
          // <Link
          //   href={`/admin/users/${row.original.seller.id}`}
          //   className="text-blue-400 hover:text-blue-600"
          // >
          row.original.seller.name,
        // </Link>
      },
      {
        id: "createdAt",
        header: "Created At",
        accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
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
    [deleteId, deleteProduct, productApi]
  );

  if (productApi.isLoading) {
    return <Loading />;
  }
  if (productApi.isError) {
    return <ServerError message={productApi.error.message} />;
  }
  return (
    <DataTable
      columns={columns}
      data={productApi.data.pages.flatMap((page) => page.products)}
      canViewMore={!!productApi.hasNextPage}
      viewMore={() => {
        void productApi.fetchNextPage();
      }}
    />
  );
};

export default ProductTable;
