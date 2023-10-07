import { Trash } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Pagination } from "@/types/admin";
import { ProductsPayloadIncluded } from "@/types/prisma";
import { api } from "@/utils/api";
import {
  DefaultLimit,
  DefaultPage,
  DefaultSearch,
  DefaultSortBy,
  DefaultSortOrder,
  SortBy,
  SortOrder,
} from "@/utils/constants";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../ui/button";
import { DataTable } from "./Table";

const ProductTable = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const page = +(params.get("page") ?? DefaultPage);
  const limit = +(params.get("limit") ?? DefaultLimit);

  const [pagination, setPagination] = useState<Pagination>({
    pageIndex: page,
    pageSize: limit,
  });

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;
  const categoryId = params.get("category") ?? undefined;
  const brandId = params.get("brand") ?? undefined;
  const modelId = params.get("model") ?? undefined;

  const productApi = api.product.getProducts.useQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
    search,
    sortBy,
    sortOrder,
    modelId,
    categoryId,
    brandId,
  });
  const deleteProduct = api.product.deleteProductById.useMutation();
  const [deleteId, setDeleteId] = useState<string>();
  const columns: ColumnDef<Omit<ProductsPayloadIncluded, "room">>[] = [
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
          variant="ghost"
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
        >
          <Trash color="red" />
        </Button>
      ),
    },
  ];

  if (productApi.isLoading) {
    return <div>Loading...</div>;
  }
  if (productApi.isError) {
    console.log(productApi.error);
    return <div>Error</div>;
  }
  if (productApi.data instanceof Error) {
    return <div>{productApi.data.message}</div>;
  }
  return (
    <DataTable
      columns={columns}
      data={productApi.data.products}
      pageCount={productApi.data.totalPages}
      pagination={pagination}
      setPagination={setPagination}
    />
  );
};

export default ProductTable;
