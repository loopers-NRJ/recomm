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
import { useMemo, useState } from "react";
import Searchbar from "../Searchbar";
import TableHeader from "../TableHeader";
import { type LogLevel, logLevel } from "@/utils/logger";
import type { Log } from "@prisma/client";

type SortBy = OmitUndefined<RouterInputs["log"]["all"]["sortBy"]>;

export default function LogTable() {
  const [sortOrder, setSortOrder] = useQueryState<SortOrder>(
    "sortOrder",
    parseAsStringEnum(["asc", "desc"]).withDefault(defaultSortOrder),
  );
  const [sortBy, setSortBy] = useQueryState<SortBy>(
    "sortBy",
    parseAsStringEnum(["createdAt", "level"]).withDefault(defaultSortBy),
  );

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(defaultSearch),
  );

  //   const rolesApi = api.role.all.useQuery({});
  const [selectedLevel, setSelectedLevel] = useState<LogLevel>();
  const logsApi = api.log.all.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      level: selectedLevel,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

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
        <Searchbar search={search} setSearch={setSearch} />
        <Label className="flex items-center gap-3">
          Filter
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
