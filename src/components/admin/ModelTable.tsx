import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FC, useMemo, useState } from "react";

import { ModelPayloadIncluded } from "@/types/prisma";
import { RouterInputs, api } from "@/utils/api";
import { DefaultSortBy, DefaultSortOrder, SortOrder } from "@/utils/constants";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "../ui/button";
import { DataTable } from "./Table";
import Loading from "../common/Loading";
import ServerError from "../common/ServerError";
import { Switch } from "../ui/switch";
import { TableProps } from "@/pages/admin/[...path]";

import { OmitUndefined } from "@/types/custom";
import TableHeader from "./TableHeader";
import { useAdminSelectedState } from "../../store/SelectedState";
import { useQueryState, parseAsStringEnum } from "next-usequerystate";

type SortBy = OmitUndefined<RouterInputs["model"]["getModels"]["sortBy"]>;

const ModelTable: FC<TableProps> = ({ search }) => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const categoryId = params.get("category") ?? undefined;
  const brandId = params.get("brand") ?? undefined;

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "category",
      "brand",
      "name",
      "createdAt",
      "updatedAt",
      "active",
    ]).withDefault(DefaultSortBy)
  );

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault(DefaultSortOrder)
  );

  const [updatingModelId, setUpdatingModelId] = useState<string>();
  const updateModelById = api.model.updateModelById.useMutation();

  const selectedState = useAdminSelectedState((selected) => selected.state);

  const modelsApi = api.model.getModels.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      categoryId,
      brandId,
      state: selectedState,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const deleteModelApi = api.model.deleteModelById.useMutation();
  const [deleteModelId, setDeleteModelId] = useState<string>();

  const columns: ColumnDef<ModelPayloadIncluded>[] = useMemo(
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
            disabled={updatingModelId === row.original.id}
            checked={row.original.active}
            // make the switch blue when active and black when inactive
            className="data-[state=checked]:bg-blue-500"
            onCheckedChange={() => {
              setUpdatingModelId(row.original.id);
              updateModelById
                .mutateAsync({
                  id: row.original.id,
                  active: !row.original.active,
                })
                .then(async () => {
                  await modelsApi.refetch();
                  setUpdatingModelId(undefined);
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          />
        ),
      },
      {
        id: "Brand",
        header: () => (
          <TableHeader
            title="brand"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.brand.name,
      },
      {
        id: "Category",
        header: () => (
          <TableHeader
            title="category"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.category.name,
      },
      {
        id: "products",
        header: "Products",
        cell: ({ row }) => (
          <Link
            href={`/admin/products?model=${row.original.id}`}
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
        cell: ({ row }) => (
          <Button size="sm" variant="outline" className="border-blue-400">
            <Link
              href={`/admin/models/edit/?id=${row.original.id}`}
              className="flex h-full w-full items-center justify-center"
            >
              Edit
            </Link>
          </Button>
        ),
      },
      {
        id: "delete",
        header: "Delete",
        cell: ({ row }) => (
          <Button
            onClick={() => {
              setDeleteModelId(row.id);
              void deleteModelApi
                .mutateAsync({ modelId: row.original.id })
                .then(async () => {
                  await modelsApi.refetch();
                  setDeleteModelId(undefined);
                });
            }}
            disabled={deleteModelId === row.id}
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
      deleteModelApi,
      deleteModelId,
      modelsApi,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
      updateModelById,
      updatingModelId,
    ]
  );

  if (modelsApi.isLoading) {
    return <Loading />;
  }
  if (modelsApi.isError) {
    return <ServerError message={modelsApi.error.message} />;
  }

  return (
    <>
      <div className="flex items-center justify-between rounded-lg">
        <span className="px-2 font-bold">Models</span>
        <Link href="/admin/models/create">
          <Button>New</Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={modelsApi.data.pages.flatMap((page) => page.models)}
        canViewMore={!!modelsApi.hasNextPage}
        viewMore={() => {
          void modelsApi.fetchNextPage();
        }}
      />
    </>
  );
};

export default ModelTable;
