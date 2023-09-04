"use client";

// import { useRouter } from "next/router";
import WishCard from "./WishCard";
import { api } from "@/utils/api";
import { useEffect } from "react";

function Wishes() {
  const {
    data: wishes,
    isLoading,
    refetch,
  } = api.user.getMywishes.useQuery({});

  useEffect(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) return <div>Loading...</div>;

  if (wishes instanceof Error) return <div>Something went wrong</div>;
  if (!wishes || wishes.length === 0) return <div>No data to Show</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="mt-10 flex w-full flex-col items-center gap-5">
      <div className="list w-full space-y-3">
        {wishes.map((wish) => (
          <WishCard key={wish.id} wish={wish} />
        ))}
      </div>
    </div>
  );
}
export default Wishes;
