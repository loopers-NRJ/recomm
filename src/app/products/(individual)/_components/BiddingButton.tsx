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
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import type { Bid, User } from "@prisma/client";
import { Loader2, UserIcon } from "lucide-react";
import { useState } from "react";

type Bidding = Bid & {
  user: User,
}

function BiddingButton({bids, roomId }: { bids: Bidding[], roomId: string }) {

  const [biddings, setBids] = useState<Bidding[]>(bids)
  const [input, setInput] = useState("")
  const bidQuery = api.room.createBid.useMutation();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast()

  async function placeBid(price: number, roomId: string) {
    await bidQuery.mutateAsync({ price, roomId }, {
      onSuccess: (bid) => {
        console.log(bid)
        if (typeof bid === "string") {
          return toast({ title: "Error placing bid", description: bid, })
        }
        setBids(prev => [...prev, bid])
      },
      onError: (e) => {
        toast({
          title: "Error placing bid",
          description: e.message,
        })
      }
    })
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button className="bg-sky-400 hover:bg-sky-500 font-bold" size="lg">Bid Your Price</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Bidders</DrawerTitle>
          <DrawerDescription>List of all the bids placed for this posting.</DrawerDescription>
          <ul className="overflow-y-scroll">
            {biddings.length === 0 && <p className="text-sm font-medium leading-none p-4">No bids yet.</p>}
            {biddings.map((bid) => {
              return (
                <li key={bid.id} className="flex justify-between items-center border rounded-lg p-3">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={bid.user.image ?? undefined} />
                      <AvatarFallback><UserIcon /></AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium leading-none">{bid.user.name}</p>
                  </div>
                  <p className="text-sm font-medium leading-none">₹{bid.price}</p>
                </li>
              )
            })}
          </ul>
        </DrawerHeader>
        <DrawerFooter>
          <Input value={input} onChange={(event) => setInput(event.target.value)} type="number" placeholder="Enter your bid amount" className="flex-grow" />
          <div className="flex flex-row gap-2">
            <Button
              variant="default"
              size="lg"
              className="bg-sky-400 w-full sm:hover:none md:hover:bg-sky-500 sm:active:bg-sky-500"
              onClick={async () => {
                setIsLoading(true)
                await placeBid(+input, roomId)
                setIsLoading(false)
              }}
            >
              {isLoading && <Loader2 />} Place Bid
            </Button>
            <DrawerClose asChild className="w-full">
              <Button variant="outline" size="lg">Close</Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default BiddingButton
