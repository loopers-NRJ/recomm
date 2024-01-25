"use client";

import { type FC, useEffect } from "react";
import { api } from "@/trpc/react";
import { type Room } from "@prisma/client";
import { Card, CardContent } from "./ui/card";

interface BiddingListProps {
  room: Room;
  revalidate: boolean;
}

const BiddingList: FC<BiddingListProps> = ({ room, revalidate }) => {
  const { data, isLoading, refetch } = api.room.getBidsByRoomId.useQuery({
    roomId: room.id,
  });

  useEffect(() => {
    void refetch();
  }, [refetch, revalidate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-full min-h-[20rem] w-full flex-col rounded-lg px-4">
      <div className="mb-3 text-sm font-light text-slate-500">
        You can view all the biddings below
      </div>
      <div className="h-80 space-y-2 overflow-scroll">
        {data?.bids.map((bid) => (
          <Card key={bid.id}>
            <CardContent className="p-5">
              <div className="flex w-full items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {bid.user.name}
                    </p>
                  </div>
                </div>

                <div className="font-semibold">
                  <span className="text-xs font-light">₹ </span>
                  {bid.price}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// <Avatar src={bid.user.image ?? "/placeholder.jpg"} />

export default BiddingList;
