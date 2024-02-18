"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminSelectedState } from "@/store/SelectedState";
import { type OmitUndefined } from "@/types/custom";
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
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Searchbar from "../../../Searchbar";
import TableHeader from "../../../TableHeader";
import { type RouterInputs } from "@/trpc/shared";
import { api } from "@/trpc/react";
import { AdminButtonLink } from "@/components/common/ButtonLink";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";
import { type Category, type Coupon } from "@prisma/client";

type SortBy = OmitUndefined<RouterInputs["coupon"]["all"]["sortBy"]>;

export default function CouponTable({ category }: { category: Category }) {
  const router = useRouter();

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "code",
      "discount",
      "type",
      "active",
      "state",
      "createdAt",
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

  const selectedState = useAdminSelectedState((selected) => selected.state);

  const couponApi = api.coupon.all.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      state: selectedState,
      categoryId: category.id,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const deleteCouponApi = api.coupon.delete.useMutation({
    onMutate: (variables) => {
      setDeletingCouponId(variables.couponId);
    },
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void couponApi.refetch();
    },
    onError: errorHandler,
    onSettled: () => {
      setDeletingCouponId(undefined);
    },
  });
  const updateCouponById = api.coupon.update.useMutation({
    onMutate: (variables) => {
      setUpdatingCouponId(variables.id);
    },
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void couponApi.refetch();
    },
    onError: errorHandler,
    onSettled: () => {
      setUpdatingCouponId(undefined);
    },
  });

  // this state is to disable the update button when the user clicks the update button
  const [updatingCouponId, setUpdatingCouponId] = useState<string>();
  // this state is to disable the delete button when the user clicks the delete button
  const [deletingCouponId, setDeletingCouponId] = useState<string>();

  const columns: ColumnDef<Coupon>[] = useMemo(
    () => [
      {
        id: "Code",
        header: () => (
          <TableHeader
            title="code"
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.code,
      },
      {
        id: "Type",
        header: () => (
          <TableHeader
            title="type"
            sortBy={sortBy}
            sortOrder={sortOrder}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.type,
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
            disabled={updatingCouponId === row.original.id}
            checked={row.original.active}
            // make the switch blue when active and black when inactive
            className="data-[state=checked]:bg-blue-500"
            onCheckedChange={() => {
              updateCouponById.mutate({
                id: row.original.id,
                active: !row.original.active,
              });
            }}
          />
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
        header: "Edit",
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <AdminButtonLink
            variant="outline"
            size="sm"
            className="border-blue-400"
            href={`/admin/category/${row.original.categoryId}/coupons/${row.original.id}/edit/`}
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
              deleteCouponApi.mutate({ couponId: row.original.id });
            }}
            disabled={deletingCouponId === row.original.id}
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
      couponApi,
      deleteCouponApi,
      deletingCouponId,
      router,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
      updateCouponById,
      updatingCouponId,
    ],
  );

  if (couponApi.isError) {
    return <ServerError message={couponApi.error?.message} />;
  }

  return (
    <>
      <Searchbar search={search} setSearch={setSearch} />
      <div className="flex items-center justify-between rounded-lg">
        <div>
          <span className="px-2 font-bold">{category.name}'s Coupons</span>
        </div>
        <div>
          <Link href={`/admin/category/${category.id}/coupons/create`}>
            <Button>New</Button>
          </Link>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={couponApi.data?.pages.flatMap((page) => page.coupons)}
        canViewMore={!!couponApi.hasNextPage}
        viewMore={() => {
          void couponApi.fetchNextPage();
        }}
        isLoading={couponApi.isLoading}
      />
    </>
  );
}
