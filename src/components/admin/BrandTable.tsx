import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

import { api } from "@/utils/api";
import {
  DefaultLimit,
  DefaultSearch,
  DefaultSortBy,
  DefaultSortOrder,
  SortBy,
  SortOrder,
} from "@/utils/constants";
import { Brand } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../ui/button";
import { DataTable } from "./Table";
import Loading from "../common/Loading";
import ServerError from "../common/ServerError";
import { Switch } from "../ui/switch";

const BrandTable = () => {
  const searchParams = useSearchParams();

  const router = useRouter();
  const path = router.query.path as ["brands", ...string[]];
  const brandId = path[1];
  const params = new URLSearchParams(searchParams);

  const limit = +(params.get("limit") ?? DefaultLimit);

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;
  const categoryId = params.get("category") ?? undefined;

  const [updatingBrandId, setUpdatingBrandId] = useState<string>();
  const updateBrandById = api.brand.updateBrandById.useMutation();

  const brandApi = api.brand.getBrandById.useQuery({
    brandId,
  });

  const brandsApi = api.brand.getBrands.useInfiniteQuery(
    {
      limit,
      search,
      sortBy,
      sortOrder,
      categoryId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const deleteBrandApi = api.brand.deleteBrandById.useMutation();
  // this state is to disable the delete button when admin clicks on it
  const [deleteBrandId, setDeleteBrandId] = useState<string>();

  const columns: ColumnDef<Brand>[] = useMemo(
    () => [
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
        id: "active",
        header: "Active",
        cell: ({ row }) => (
          <Switch
            disabled={updatingBrandId === row.original.id}
            checked={row.original.active}
            // make the switch blue when active and black when inactive
            className="data-[state=checked]:bg-blue-500"
            onCheckedChange={() => {
              setUpdatingBrandId(row.original.id);
              updateBrandById
                .mutateAsync({
                  id: row.original.id,
                  active: !row.original.active,
                })
                .then(async () => {
                  await brandsApi.refetch();
                  setUpdatingBrandId(undefined);
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          />
        ),
      },
      {
        id: "edit",
        header: "",
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <Button size="sm" variant="outline" className="border-blue-400">
            <Link
              href={`/admin/brands/edit/?id=${row.original.id}`}
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
            size="sm"
            variant="outline"
            className="border-red-400"
          >
            Delete
          </Button>
        ),
      },
    ],
    [brandsApi, deleteBrandApi, deleteBrandId, updateBrandById, updatingBrandId]
  );

  if (brandsApi.isLoading || brandApi.isLoading) {
    return <Loading />;
  }
  if (brandsApi.isError || brandApi.isError) {
    return (
      <ServerError
        message={brandApi.error?.message ?? brandsApi.error?.message ?? ""}
      />
    );
  }

  return (
    <>
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
        <>
          <div className="flex items-center justify-between rounded-lg px-2 py-2">
            <div>
              <span className="px-2 font-bold">Brands</span>
            </div>
            <Link href="/admin/brands/create">
              <Button>New</Button>
            </Link>
          </div>
          <DataTable
            columns={columns}
            data={brandsApi.data.pages.flatMap((page) => page.brands)}
            canViewMore={!!brandsApi.hasNextPage}
            viewMore={() => {
              void brandsApi.fetchNextPage();
            }}
          />
        </>
      )}
    </>
  );
};

export default BrandTable;
