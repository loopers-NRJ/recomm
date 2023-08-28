"use client";

import { api } from "@/utils/api";
import { Room } from "@prisma/client";
import { FC } from "react";
import Avatar from "./navbar/Avatar";
interface BiddingProps {
  room: Room;
}

const BiddingList: FC<BiddingProps> = ({ room }) => {
  const {
    data: bids,
    isLoading,
    isError,
  } = api.room.getBidsByRoomId.useQuery({ roomId: room.id });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (!bids || isError) {
    return <div>Error</div>;
  }
  if (bids instanceof Error) {
    return <div>{bids.message}</div>;
  }
  return (
    <div className="flex h-full min-h-[20rem] w-full flex-col rounded-lg bg-red-200">
      {bids.map((bid) => (
        <div key={bid.id} className="flex flex-row justify-between">
          <div className="flex flex-col">
            <Avatar src={bid.user.image ?? "/placeholder.jpg"}></Avatar>
            <div className="text-lg font-semibold">{bid.user.name}</div>
          </div>
          <div className="text-lg font-semibold">{bid.price}</div>
        </div>
      ))}
    </div>
  );
};
export default BiddingList;
