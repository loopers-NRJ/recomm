"use client";

import WishCard from "./WishCard";
import { api } from "@/utils/api";
import { useEffect } from "react";

const Wishes = () => {
  const {
    data: wishes,
    isLoading,
    refetch,
  } = api.user.getMywishes.useQuery({});

  // TODO: delete wish
  // const deleteWish = async (id: string) => {
  //   // await api.wish.deleteWish.useMutation(id);
  //   // await refetch();
  // };
  useEffect(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) return <div>Loading...</div>;
  if (wishes instanceof Error) return <div>Something went wrong</div>;
  if (!wishes || wishes.length === 0) return <div>No data to Show</div>;

  return (
    <div className="mt-10 flex w-full flex-col items-center gap-5">
      <div className="list w-full space-y-3">
        {wishes.map((wish) => (
          <div key={wish.id} className="relative">
            <button
              // onClick={() => deleteWish(wish.id)}
              className="absolute -top-[10px] right-0 flex h-[20px] w-[20px] select-none items-center justify-center rounded-full bg-red-500 p-0"
            >
              x
            </button>
            <WishCard wish={wish} />
          </div>
        ))}
      </div>
    </div>
  );
};
export default Wishes;
