import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ModelPayloadIncluded } from "@/types/prisma";
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
import { useRouter } from "next/router";
import Loading from "../common/Loading";
import ServerError from "../common/ServerError";
import { Switch } from "../ui/switch";

const ModelTable = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const router = useRouter();
  const limit = +(params.get("limit") ?? DefaultLimit);

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;
  const categoryId = params.get("category") ?? undefined;
  const brandId = params.get("brand") ?? undefined;

  const [updatingModelId, setUpdatingModelId] = useState<string>();
  const updateModelById = api.model.updateModelById.useMutation();

  const modelsApi = api.model.getModels.useInfiniteQuery(
    {
      limit,
      search,
      sortBy,
      sortOrder,
      categoryId,
      brandId,
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
        header: "Name",
        accessorFn: (row) => row.name,
      },
      {
        id: "Brand",
        header: "Brand",
        accessorFn: (row) => row.brand.name,
      },
      {
        id: "Category",
        header: "Category",
        // TODO: display the array of categories instead of first one
        accessorFn: (row) => row.categories[0]?.name,
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
        id: "edit",
        header: "",
        accessorFn: (row) => row.id,
        cell: ({ row }) => (
          <Button
            onClick={() => {
              void router.push(`/admin/models/edit/?id=${row.original.id}`);
            }}
            size="sm"
            variant="outline"
            className="border-blue-400"
          >
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
        header: "",
        accessorFn: (row) => row.id,
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
      router,
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
      <div className="flex items-center justify-between rounded-lg px-2 py-2">
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
