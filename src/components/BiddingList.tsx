"use client";

import { FC, useEffect } from "react";

import { api } from "@/utils/api";
import { Room } from "@prisma/client";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

import { AvatarFallback } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";

interface BiddingListProps {
  room: Room;
}

const BiddingList: FC<BiddingListProps> = ({ room }) => {
  const {
    data: bids,
    isLoading,
    refetch,
  } = api.room.getBidsByRoomId.useQuery({ roomId: room.id });

  useEffect(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (bids instanceof Error) {
    return <div>{bids.message}</div>;
  }

  return (
    <div className="flex h-full min-h-[20rem] w-full flex-col rounded-lg px-4">
      {/* TODO: Add a duplicate bidding check for users and amount */}
      {/* TODO: Add Highest Bidding to Room in Database */}
      <div className="mb-3 text-sm font-light text-slate-500">
        You can view all the biddings below
      </div>
      <div className="h-80 space-y-2 overflow-scroll">
        {bids!.map((bid) => (
          <Card key={bid.id}>
            <CardContent className="p-5">
              <div className="flex w-full items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      width={40}
                      className="rounded-full shadow-sm"
                      src={bid.user.image!}
                    />
                    <AvatarFallback>
                      <AvatarImage
                        width={40}
                        className="rounded-full shadow-sm"
                        src="/placeholder.jpg"
                      />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {bid.user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {bid.user.email}
                    </p>
                  </div>
                </div>

                <div className="text-lg font-semibold">
                  <span className="text-xs font-light">Rs. </span>
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

export default BiddingList;
