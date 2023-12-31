"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { api } from "@/trpc/react";
import LoadingWishes from "./loading/LoadingWishes";
import WishCard from "./WishCard";
import ServerError from "./common/ServerError";
import {
  defaultSearch,
  type SortOrder,
  defaultSortOrder,
} from "@/utils/constants";
import { useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import Loading from "./common/Loading";

function Wishes() {
  const session = useSession();

  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const search = params.get("search") ?? defaultSearch;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? defaultSortOrder;
  const wishesApi = api.user.getMywishes.useInfiniteQuery(
    {
      search,
      sortOrder,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  useEffect(() => {
    void wishesApi.refetch();
  }, [wishesApi, session.status]);

  if (wishesApi.isLoading) {
    return <LoadingWishes />;
  }
  if (wishesApi.isError) {
    return <ServerError message={wishesApi.error.message} />;
  }

  const wishes = wishesApi.data.pages.flatMap((page) => page.wishes);
  if (wishes.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        No Data Available
      </div>
    );
  }

  return (
    <div className="mt-10 flex w-full flex-col items-center gap-5">
      <div className="list w-full space-y-3">
        {wishes.map((wish) => (
          <WishCard wish={wish} key={wish.id} />
        ))}
      </div>
      {!wishesApi.isLoading && wishesApi.isFetching && <Loading />}
      <Button
        className="mt-8 self-end"
        onClick={() => {
          void wishesApi.fetchNextPage();
        }}
        disabled={!wishesApi.hasNextPage}
        variant="ghost"
      >
        View More
      </Button>
    </div>
  );
}
export default Wishes;
