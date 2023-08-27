"use client";

import { api } from "@/utils/api";
import Avatar from "./navbar/Avatar";
import { FC, useState } from "react";
import { Bid, User } from "@prisma/client";

interface BiddingProps {
  productId: string;
}

type BidObj = Bid & {
  user: User;
};

const BiddingList: FC<BiddingProps> = ({ productId }) => {
  const [biddings, setBids] = useState([] as BidObj[]);

  const { data: room, isLoading } = api.product.getRoomByProductId.useQuery({
    productId,
  });

  if (isLoading) return <div className="">Loading...</div>;
  if (!room) return <div className="">No data to Show</div>;
  if (room instanceof Error) return <div>Something went wrong</div>;

  console.log("room", room);

  const { bids } = room;
  setBids(bids);

  return (
    <div className="flex h-full min-h-[20rem] w-full flex-col rounded-lg bg-red-200">
      {biddings.map((bid) => (
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
