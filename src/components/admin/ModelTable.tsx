import { Pen, Trash } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

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

  const modelApi = api.model.getModels.useInfiniteQuery(
    {
      limit,
      search,
      sortBy,
      sortOrder,
      categoryId,
      brandId,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    }
  );

  const deleteModelApi = api.model.deleteModelById.useMutation();
  const [deleteModelId, setDeleteModelId] = useState<string>();

  if (modelApi.isLoading) {
    return <div>Loading...</div>;
  }
  if (modelApi.isError) {
    console.log(modelApi.error);
    return <div>Error</div>;
  }

  const columns: ColumnDef<ModelPayloadIncluded>[] = [
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
      id: "edit",
      header: "",
      accessorFn: (row) => row.id,
      cell: ({ row }) => (
        <Button
          onClick={() => {
            void router.push(`/admin/models/edit/?id=${row.original.id}`);
          }}
          size="sm"
          variant="ghost"
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
          onClick={() => {
            setDeleteModelId(row.id);
            void deleteModelApi
              .mutateAsync({ modelId: row.original.id })
              .then(async () => {
                await modelApi.refetch();
                setDeleteModelId(undefined);
              });
          }}
          disabled={deleteModelId === row.id}
          size="sm"
          variant="ghost"
        >
          <Trash color="red" />
        </Button>
      ),
    },
  ];

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
        data={modelApi.data.pages.flatMap((page) => page.models)}
        canViewMore={!!modelApi.hasNextPage}
        viewMore={() => {
          void modelApi.fetchNextPage();
        }}
      />
    </>
  );
};

export default ModelTable;
