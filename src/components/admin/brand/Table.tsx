import { Pen, Trash } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

import useAdminModal from "@/hooks/useAdminModel";
import { Pagination } from "@/types/admin";
import { api } from "@/utils/api";
import {
  DefaultLimit,
  DefaultPage,
  DefaultSearch,
  DefaultSortBy,
  DefaultSortOrder,
  SortBy,
  SortOrder,
} from "@/utils/validation";
import { Brand } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../../ui/button";
import { DataTable } from "../Table";
import { CreateModel } from "./CreateModel";
import { EditModel } from "./EditModel";

const BrandTable = () => {
  const searchParams = useSearchParams();

  const router = useRouter();
  const path = router.query.path as ["brands", ...string[]];
  const brandId = path[1];
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

  const brandApi = api.brand.getBrandByIdOrNull.useQuery({
    brandId,
  });

  const brandsApi = api.brand.getBrands.useQuery({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
    search,
    sortBy,
    sortOrder,
    categoryId,
  });

  const [editableBrand, setEditableBrand] = useState<Brand>();
  const deleteBrandApi = api.brand.deleteBrandById.useMutation();
  // this state is to disable the delete button when admin clicks on it
  const [deleteBrandId, setDeleteBrandId] = useState<string>();
  const { open: openModel } = useAdminModal();

  if (brandsApi.isLoading) {
    return <div>Loading...</div>;
  }
  if (brandsApi.isError || brandApi.isError) {
    console.log(brandsApi.error ?? brandApi.error);
    return <div>Something went wrong</div>;
  }
  if (brandsApi.data instanceof Error) {
    return <div>{brandsApi.data.message}</div>;
  }
  if (brandApi.data instanceof Error) {
    return <div>{brandApi.data.message}</div>;
  }

  const columns: ColumnDef<Brand>[] = [
    {
      id: "Name",
      header: "Name",
      accessorFn: (row) => row.name,
    },
    {
      id: "createdAt",
      header: "Created At",
      accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
    },
    {
      id: "updatedAt",
      header: "Updated At",
      accessorFn: (row) => row.updatedAt.toLocaleString("en-US"),
    },
    {
      id: "models",
      header: "Models",
      cell: ({ row }) => (
        <Link
          href={`/admin/models?brand=${row.original.id}`}
          className="text-blue-400 hover:text-blue-600"
        >
          Models
        </Link>
      ),
    },
    {
      id: "products",
      header: "Products",
      cell: ({ row }) => (
        <Link
          href={`/admin/products?brand=${row.original.id}`}
          className="text-blue-400 hover:text-blue-600"
        >
          Products
        </Link>
      ),
    },
    {
      id: "edit",
      header: "",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <Button
          onClick={() => {
            setEditableBrand(row.original);
            openModel();
          }}
        >
          <Pen />
        </Button>
      ),
    },
    {
      id: "delete",
      header: "",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <Button
          variant="destructive"
          onClick={() => {
            setDeleteBrandId(row.original.id);
            void deleteBrandApi
              .mutateAsync({
                brandId: row.original.id,
              })
              .then(async () => {
                await brandsApi.refetch();
                setDeleteBrandId(undefined);
              });
          }}
          disabled={deleteBrandId === row.original.id}
        >
          <Trash />
        </Button>
      ),
    },
  ];

  return (
    <>
      {editableBrand ? (
        <EditModel
          brand={editableBrand}
          setBrand={setEditableBrand}
          onEdit={() => void brandsApi.refetch()}
        />
      ) : (
        <CreateModel onCreate={() => void brandsApi.refetch()} />
      )}
      {brandApi.data ? (
        <div>
          <nav>
            <Link
              href="/admin/brands"
              className="text-blue-400 hover:text-blue-600"
            >
              Brands
            </Link>
            <span className="mx-2">{"/"}</span>
            <span>{brandApi.data.name}</span>
          </nav>

          {/* TODO: display the brand image here */}
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">Brand Name</div>
              <div>{brandApi.data.name}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">Created At</div>
              <div>{brandApi.data.createdAt.toLocaleString("en-US")}</div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-lg font-medium">Updated At</div>
              <div>{brandApi.data.updatedAt.toLocaleString("en-US")}</div>
            </div>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={brandsApi.data.brands}
          pageCount={brandsApi.data.totalPages}
          pagination={pagination}
          setPagination={setPagination}
        />
      )}
    </>
  );
};

export default BrandTable;
