import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FC, useMemo, useState } from "react";

import { ProductsPayloadIncluded } from "@/types/prisma";
import { RouterInputs, api } from "@/utils/api";
import { DefaultSortBy, DefaultSortOrder, SortOrder } from "@/utils/constants";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../ui/button";
import { DataTable } from "./Table";
import Loading from "../common/Loading";
import ServerError from "../common/ServerError";
import { TableProps } from "@/pages/admin/[...path]";
import { OmitUndefined } from "@/types/custom";
import TableHeader from "./TableHeader";
import { useAdminSelectedState } from "../../store/SelectedState";
import { useQueryState, parseAsStringEnum } from "next-usequerystate";

type SortBy = OmitUndefined<RouterInputs["product"]["getProducts"]["sortBy"]>;

const ProductTable: FC<TableProps> = ({ search }) => {
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
    ]).withDefault(DefaultSortBy)
  );

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault(DefaultSortOrder)
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
    }
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
            href={`/admin/category/${row.original.model.category.slug}=${row.original.model.category.id}`}
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
    ]
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
