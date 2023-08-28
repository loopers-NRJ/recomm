"use client";

import { api } from "@/utils/api";
import { Room } from "@prisma/client";
import { FC } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
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
    <div className="flex h-full min-h-[20rem] w-full flex-col rounded-lg px-4">
      {/* TODO: Add Highest Bidding to Room in Database */}
      {/* <div className="flex w-full flex-row items-center justify-between">
        <span>Highest Bid:</span>
        <div className="text-2xl font-semibold">
          <span className="text-xs font-light">Rs. </span>
          {3000}
        </div>
      </div> */}
      <div className="mb-3 text-sm font-light text-slate-500">
        You can view all the biddings below
      </div>
      <div>
        {bids.map((bid) => (
          <Card key={bid.id}>
            <CardContent className="p-5">
              <div className="flex w-full items-center justify-between space-x-4">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      width={40}
                      className="rounded-full shadow-sm"
                      src={bid.user.image ?? "/placeholder.jpg"}
                    />
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      Sofia Davis
                    </p>
                    <p className="text-sm text-muted-foreground">
                      m@example.com
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

// {bids.map((bid) => (
//   <div key={bid.id} className="flex flex-row justify-between">
//     <div className="flex flex-col">
//       <Avatar src={bid.user.image ?? "/placeholder.jpg"}></Avatar>
//       <div className="text-lg font-semibold">{bid.user.name}</div>
//     </div>
//     <div className="text-lg font-semibold">{bid.price}</div>
//   </div>
// ))}
export default BiddingList;
