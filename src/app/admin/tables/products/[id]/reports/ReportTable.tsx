"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { type OmitUndefined } from "@/types/custom";
import { api } from "@/trpc/react";
import { type RouterInputs } from "@/trpc/shared";
import {
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  type SortOrder,
} from "@/utils/constants";
import type { ColumnDef } from "@tanstack/react-table";
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";
import Link from "next/link";
import { useMemo, useState } from "react";

import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";
import { type ReportPayloadIncluded } from "@/types/prisma";
import TableHeader from "../../../TableHeader";
import AdminSearchbar from "../../../AdminSearchbar";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

type SortBy = OmitUndefined<RouterInputs["report"]["all"]["sortBy"]>;

export default function ReportTable({ productId }: { productId: string }) {
  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "productName",
      "createdAt",
      "updatedAt",
      "userName",
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

  const reportsApi = api.report.all.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      productId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const deleteReportApi = api.report.delete.useMutation({
    onMutate: (variables) => {
      setDeleteBrandId(variables.id);
    },

    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void reportsApi.refetch();
    },
    onError: errorHandler,
    onSettled: () => {
      setDeleteBrandId(undefined);
    },
  });
  // this state is to disable the delete button when admin clicks on it
  const [deleteReportId, setDeleteBrandId] = useState<string>();

  const columns: ColumnDef<ReportPayloadIncluded>[] = useMemo(
    () => [
      {
        id: "productName",
        header: () => (
          <TableHeader
            title="productName"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.product.title,
      },
      {
        id: "userName",
        header: () => (
          <TableHeader
            title="userName"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.user.name,
      },
      {
        id: "Description",
        header: "Description",
        cell: ({ row }) => (
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">View</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Report By {row.original.user.name}</DrawerTitle>
                <DrawerDescription>
                  {row.original.description}
                </DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose>
                  <Button>Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ),
        accessorFn: (row) => row.description,
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
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <Button
            onClick={() => {
              deleteReportApi.mutate({
                id: row.original.id,
              });
            }}
            disabled={deleteReportId === row.original.id}
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
      reportsApi,
      deleteReportApi,
      deleteReportId,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
    ],
  );

  if (reportsApi.isError) {
    return <ServerError message={reportsApi.error.message} />;
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
        data={reportsApi.data?.pages.flatMap((page) => page.reports)}
        canViewMore={!!reportsApi.hasNextPage}
        viewMore={() => {
          void reportsApi.fetchNextPage();
        }}
        isLoading={reportsApi.isLoading}
      />
    </>
  );
}
