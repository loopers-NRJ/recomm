"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminSelectedState } from "@/store/SelectedState";
import { type OmitUndefined } from "@/types/custom";
import { api } from "@/trpc/react";
import { type RouterInputs } from "@/trpc/shared";
import {
  defaultSearch,
  defaultSortBy,
  defaultSortOrder,
  type SortOrder,
} from "@/utils/constants";
import type { Brand } from "@prisma/client";
import type { ColumnDef } from "@tanstack/react-table";
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import AdminSearchbar from "../AdminSearchbar";
import TableHeader from "../TableHeader";
import { AdminButtonLink } from "@/components/common/ButtonLink";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";

type SortBy = OmitUndefined<RouterInputs["brand"]["all"]["sortBy"]>;

export default function BrandTable() {
  const searchParams = useSearchParams();

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "name",
      "createdAt",
      "updatedAt",
      "active",
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
  const categoryId = searchParams.get("category") ?? undefined;

  const [updatingBrandId, setUpdatingBrandId] = useState<string>();
  const updateBrandById = api.brand.update.useMutation({
    onMutate: (variables) => {
      setUpdatingBrandId(variables.id);
    },
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void brandsApi.refetch();
    },
    onError: errorHandler,
    onSettled: () => {
      setUpdatingBrandId(undefined);
    },
  });

  const selectedState = useAdminSelectedState((selected) => selected.state);

  const brandsApi = api.brand.all.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      categoryId,
      state: selectedState,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const deleteBrandApi = api.brand.delete.useMutation({
    onMutate: (variables) => {
      setDeleteBrandId(variables.brandId);
    },

    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void brandsApi.refetch();
    },
    onError: errorHandler,
    onSettled: () => {
      setDeleteBrandId(undefined);
    },
  });
  // this state is to disable the delete button when admin clicks on it
  const [deleteBrandId, setDeleteBrandId] = useState<string>();

  const columns: ColumnDef<Brand>[] = useMemo(
    () => [
      {
        id: "Name",

        header: () => (
          <TableHeader
            title="name"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.name,
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
              updateBrandById.mutate({
                id: row.original.id,
                active: !row.original.active,
              });
            }}
          />
        ),
      },
      {
        id: "models",
        header: "Models",
        cell: ({ row }) => (
          <Link
            href={`/admin/tables/models?brand=${row.original.id}`}
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
            href={`/admin/tables/products?brand=${row.original.id}`}
            className="text-blue-400 hover:text-blue-600"
          >
            Products
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
        id: "edit",
        header: "Edit",
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <AdminButtonLink
            size="sm"
            variant="outline"
            className="border-blue-400"
            href={`/admin/brands/edit/${row.original.id}`}
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
              deleteBrandApi.mutate({
                brandId: row.original.id,
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
    [
      brandsApi,
      deleteBrandApi,
      deleteBrandId,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
      updateBrandById,
      updatingBrandId,
    ],
  );

  if (brandsApi.isError) {
    return <ServerError message={brandsApi.error.message} />;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 rounded-lg">
        <AdminSearchbar search={search} setSearch={setSearch} />

        <Link href="/admin/brands/create">
          <Button>New</Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={brandsApi.data?.pages.flatMap((page) => page.brands)}
        canViewMore={!!brandsApi.hasNextPage}
        viewMore={() => {
          void brandsApi.fetchNextPage();
        }}
        isLoading={brandsApi.isLoading}
      />
    </>
  );
}
