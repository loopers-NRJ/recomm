import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer'
import type { Bid, User } from '@prisma/client'
import React from 'react'
import Image from 'next/image'
import BiddingList from './BiddingList'

type Bidding = Bid & {
  user: User,
}

async function ViewBidsButton({ bids }: { bids: Bidding[] }) {
  return (
    <Drawer>
      <DrawerTrigger>
        <Button>View Bids</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Bidders</DrawerTitle>
        </DrawerHeader>
        <BiddingList biddings={bids} />
        <DrawerFooter>
          <DrawerClose className='px-4 py-2 rounded-lg bg-primary w-full text-white'> Close </DrawerClose> 
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default ViewBidsButton
