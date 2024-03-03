"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type OmitUndefined } from "@/types/custom";
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
import { useMemo, useState } from "react";
import AdminSearchbar from "../AdminSearchbar";
import TableHeader from "../TableHeader";
import { type LogLevel, logLevel } from "@/utils/logger";
import type { Log, State } from "@prisma/client";
import { states } from "@/types/prisma";
import { Button } from "@/components/ui/button";
import { AdminButtonLink } from "@/components/common/ButtonLink";

type SortBy = OmitUndefined<RouterInputs["log"]["all"]["sortBy"]>;

export default function LogTable() {
  const [sortOrder, setSortOrder] = useQueryState<SortOrder>(
    "sortOrder",
    parseAsStringEnum(["asc", "desc"]).withDefault(DEFAULT_SORT_ORDER),
  );
  const [sortBy, setSortBy] = useQueryState<SortBy>(
    "sortBy",
    parseAsStringEnum(["createdAt", "level", "state"]).withDefault(
      DEFAULT_SORT_BY,
    ),
  );

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [selectedState, setSelectedState] = useState<State | "common" | "">("");
  const clientStateToQuery = (state: State | "common" | "") => {
    if (state === "") return;
    if (state === "common") return null;
    return state;
  };
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>();
  const logsApi = api.log.all.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      level: selectedLevel,
      state: clientStateToQuery(selectedState),
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const clearLogs = api.log.clear.useMutation({
    onSuccess: async () => {
      await logsApi.refetch();
    },
  });

  const columns: ColumnDef<Log>[] = useMemo(
    () => [
      {
        id: "name",
        header: () => (
          <TableHeader
            title="level"
            sortOrder={sortOrder}
            setSortOrder={(order) => void setSortOrder(order)}
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
          />
        ),
        accessorFn: (row) => row.level,
      },
      {
        id: "state",
        header: () => (
          <TableHeader
            title="state"
            sortOrder={sortOrder}
            setSortOrder={(order) => void setSortOrder(order)}
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
          />
        ),
        accessorFn: (row) => row.state ?? "common",
      },
      {
        id: "message",
        header: "Message",
        accessorFn: (row) => row.message,
      },
      {
        id: "detail",
        header: "Detail",
        accessorFn: (row) => row.detail,
      },
      {
        id: "createdAt",
        header: () => (
          <TableHeader
            title="createdAt"
            sortOrder={sortOrder}
            setSortOrder={(order) => void setSortOrder(order)}
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
          />
        ),
        accessorFn: (row) => row.createdAt,
      },
    ],
    [sortBy, sortOrder, logsApi],
  );

  if (logsApi.isError) {
    return <ServerError message={logsApi.error.message} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <AdminSearchbar search={search} setSearch={setSearch} />
        <Label className="flex items-center gap-3">
          Level
          <Select
            onValueChange={(value) => {
              setSelectedLevel(value === "" ? undefined : (value as LogLevel));
            }}
            value={selectedLevel ?? ""}
          >
            <SelectTrigger className="w-[180px] capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              {logLevel.map((level) => (
                <SelectItem value={level} key={level} className="capitalize">
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Label>
        <Label className="flex items-center gap-3">
          State
          <Select
            onValueChange={(value) => {
              setSelectedState(value as State);
            }}
            value={selectedState ?? ""}
          >
            <SelectTrigger className="w-[180px] capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="h-80">
              <SelectItem value="">All</SelectItem>
              <SelectItem value="common">common</SelectItem>
              {states.map((state) => (
                <SelectItem value={state} key={state} className="capitalize">
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Label>
        <AdminButtonLink
          href="/api/generate/logs"
          variant="outline"
          size="sm"
          className="border-blue-400"
        >
          EXPORT
        </AdminButtonLink>
        <Button
          size="sm"
          variant="outline"
          className="border-red-400"
          onClick={() => {
            clearLogs.mutate();
          }}
        >
          CLEAR
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={logsApi.data?.pages.flatMap((page) => page.logs)}
        canViewMore={!!logsApi.hasNextPage}
        viewMore={() => {
          void logsApi.fetchNextPage();
        }}
        isLoading={logsApi.isLoading}
      />
    </div>
  );
}
