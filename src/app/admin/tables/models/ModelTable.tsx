"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminselectedCity } from "@/store/AdminSelectedCity";
import { type OmitUndefined } from "@/types/custom";
import { type ModelPayloadIncluded } from "@/types/prisma";
import { api } from "@/trpc/react";
import { type RouterInputs } from "@/trpc/shared";
import {
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  type SortOrder,
} from "@/utils/constants";
import { type ColumnDef } from "@tanstack/react-table";
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import AdminSearchbar from "../AdminSearchbar";
import TableHeader from "../TableHeader";
import { AdminButtonLink } from "@/components/common/ButtonLink";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";

type SortBy = OmitUndefined<RouterInputs["model"]["allForAdmin"]["sortBy"]>;

export default function ModelTable() {
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
    ]).withDefault(DEFAULT_SORT_BY),
  );

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault(
      DEFAULT_SORT_ORDER,
    ),
  );
  const city = useAdminselectedCity((selected) => selected.city?.value);
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const updateModelById = api.model.update.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void modelsApi.refetch();
    },
    onError: errorHandler,
  });

  const createModelApi = api.model.create.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      toast.success("Model copied successfully");
      void modelsApi.refetch();
    },
    onError: errorHandler,
  });

  const modelsApi = api.model.allForAdmin.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      categoryId,
      brandId,
      city: city ?? "",
    },
    {
      enabled: city !== undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const deleteModelApi = api.model.delete.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      void modelsApi.refetch();
    },
  });

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
            disabled={
              updateModelById.isLoading &&
              updateModelById.variables?.id === row.original.id
            }
            checked={row.original.active}
            // make the switch blue when active and black when inactive
            className="data-[state=checked]:bg-blue-500"
            onCheckedChange={() => {
              updateModelById.mutate({
                id: row.original.id,
                active: !row.original.active,
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
            href={`/admin/tables/products?model=${row.original.id}`}
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
        id: "createdBy",
        header: () => (
          <TableHeader
            title="createdBy"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.createdBy.name,
      },
      {
        id: "updatedBy",
        header: () => (
          <TableHeader
            title="updatedBy"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.updatedBy?.name ?? "N/A",
      },
      {
        id: "copy",
        header: "Copy",
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="outline"
            className="border-blue-400"
            disabled={
              createModelApi.isLoading &&
              createModelApi.variables?.name === row.original.name + " copy"
            }
            onClick={() => {
              const model = row.original;
              createModelApi.mutate({
                name: model.name + " copy",
                categoryId: model.categoryId,
                brandId: model.brandId,
                city: model.cityValue,
                atomicQuestions: model.atomicQuestions,
                multipleChoiceQuestions: model.multipleChoiceQuestions.map(
                  (question) => ({
                    type: question.type,
                    questionContent: question.questionContent,
                    choices: question.choices.map((choice) => choice.value) as [
                      string,
                      ...string[],
                    ],
                  }),
                ),
              });
            }}
          >
            Copy
          </Button>
        ),
      },
      {
        id: "edit",
        header: "Edit",
        cell: ({ row }) => (
          <AdminButtonLink
            size="sm"
            variant="outline"
            className="border-blue-400"
            href={`/admin/models/edit/${row.original.id}`}
          >
            Edit
          </AdminButtonLink>
        ),
      },
      {
        id: "delete",
        header: "Delete",
        cell: ({ row }) => (
          <Button
            onClick={() => {
              deleteModelApi.mutate({ modelId: row.original.id });
            }}
            disabled={
              deleteModelApi.isLoading &&
              deleteModelApi.variables?.modelId === row.original.id
            }
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
      modelsApi,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
      updateModelById,
    ],
  );

  if (modelsApi.isError) {
    return <ServerError message={modelsApi.error.message} />;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 rounded-lg">
        <AdminSearchbar search={search} setSearch={setSearch} />
        <Link href="/admin/models/create">
          <Button>New</Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={modelsApi.data?.pages.flatMap((page) => page.models)}
        canViewMore={!!modelsApi.hasNextPage}
        viewMore={() => {
          void modelsApi.fetchNextPage();
        }}
        isLoading={modelsApi.isLoading}
      />
    </>
  );
}
