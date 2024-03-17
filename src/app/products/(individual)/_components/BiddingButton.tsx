"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import type { Bid, User } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import BiddingList from "./BiddingList";

type Bidding = Bid & {
  user: User;
};

function BiddingButton({ bids, roomId }: { bids: Bidding[]; roomId: string }) {
  const [biddings, setBids] = useState<Bidding[]>(bids);
  const [input, setInput] = useState("");
  const bidQuery = api.room.createBid.useMutation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function placeBid(price: number, roomId: string) {
    await bidQuery.mutateAsync(
      { price, roomId },
      {
        onSuccess: (bid) => {
          console.log(bid);
          if (typeof bid === "string") {
            return toast({ title: "Cannot place Bid", description: bid });
          }
          setBids((prev) => [...prev, bid]);
        },
        onError: (e) => {
          toast({
            title: "Error place bid",
            description: e.message,
          });
        },
      },
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="bg-sky-400 font-bold hover:bg-sky-500" size="lg">
          Bid Your Price
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Bidders</DrawerTitle>
          <DrawerDescription>
            List of all the bids placed for this posting.
          </DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <BiddingList biddings={biddings} />
          <Input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            type="number"
            placeholder="Enter your bid amount"
            className="flex-grow"
          />
          <div className="flex flex-row gap-2">
            <Button
              variant="default"
              size="lg"
              className="sm:hover:none w-full bg-sky-400 sm:active:bg-sky-500 md:hover:bg-sky-500"
              onClick={async () => {
                setIsLoading(true);
                await placeBid(+input, roomId);
                setIsLoading(false);
              }}
            >
              {isLoading && <Loader2 className="mx-1 animate-spin" />} Place Bid
            </Button>
            <DrawerClose asChild className="w-full">
              <Button variant="outline" size="lg">
                Close
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default BiddingButton;
