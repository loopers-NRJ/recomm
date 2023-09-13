"use client";

import WishCard from "./WishCard";
import { api } from "@/utils/api";
import { useEffect } from "react";
import LoadingWishes from "./loading/LoadingWishes";

const Wishes = () => {
  const {
    data: wishes,
    isLoading,
    refetch,
  } = api.user.getMywishes.useQuery({});

  useEffect(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) return <LoadingWishes />;
  if (wishes instanceof Error) return <div>Something went wrong</div>;
  if (!wishes || wishes.length === 0) return <div>No data to Show</div>;

  return (
    <div className="mt-10 flex w-full flex-col items-center gap-5">
      <div className="list w-full space-y-3">
        {wishes.map((wish) => (
          <WishCard wish={wish} key={wish.id} />
        ))}
      </div>
    </div>
  );
};
export default Wishes;
