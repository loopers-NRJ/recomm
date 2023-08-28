"use client";

import Avatar from "./navbar/Avatar";
import { FC } from "react";
import Product from "@/types/product";

interface BiddingProps {
  product: Product;
}

const BiddingList: FC<BiddingProps> = ({ product }) => {
  const { bids } = product.room!;

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
