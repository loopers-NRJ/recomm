"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import type { Bid, User } from "@prisma/client";
import { UserIcon } from "lucide-react";

type Bidding = Bid & {
  user: User,
}

function BiddingButton({ bids }: { bids: Bidding[] }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="bg-sky-400 hover:bg-sky-500 font-bold" size="lg">Bid Your Price</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Bidders</DrawerTitle>
          <DrawerDescription>List of all the bids placed for this posting.</DrawerDescription>
        </DrawerHeader>
        <ul className="overflow-y-scroll">
          {bids.length === 0 && <p className="text-sm font-medium leading-none p-4">No bids yet.</p>}
          {bids.map((bid) => {
            return (
              <li key={bid.id} className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={bid.user.image ?? undefined} />
                    <AvatarFallback><UserIcon /></AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-medium leading-none">Example User</p>
                </div>
                <p className="text-sm font-medium leading-none">{bid.price}</p>
              </li>
            )
          })}
        </ul>
        <DrawerFooter>
          <Input type="number" placeholder="Enter your bid amount" className="flex-grow" />
          <div className="flex flex-row gap-2">
            <Button variant="default" className="bg-sky-400 flex-grow">Place Bid</Button>
            <DrawerClose className="flex-grow">
              <Button variant="outline" className="w-full">Cancel</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default BiddingButton
