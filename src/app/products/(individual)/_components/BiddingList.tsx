import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Bid, User } from '@prisma/client'
import { UserIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Bidding = Bid & {
  user: User
}

function BiddingList({ biddings }: { biddings: Bidding[] }) {
  return (
    <ul className="overflow-y-scroll">
      {biddings.length === 0 && <p className="text-sm font-medium leading-none p-4">No bids yet.</p>}
      {biddings.map((bid) => {
        return (
          <Link key={bid.id} href={`/user/${bid.userId}/profile`}>
            <li className="flex justify-between items-center border rounded-lg p-3">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={bid.user.image ?? undefined} />
                  <AvatarFallback><UserIcon /></AvatarFallback>
                </Avatar>
                <p className="text-sm font-medium leading-none">{bid.user.name}</p>
              </div>
              <p className="text-sm font-medium leading-none">₹{bid.price}</p>
            </li>
          </Link>
        )
      })}
    </ul>
  )
}

export default BiddingList
