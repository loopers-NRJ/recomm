import { Card } from '@/components/ui/card';
import { api } from '@/trpc/server';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

async function UserListings({ userId }: { userId: string }) {
     const { listings } = await api.user.listingsById.query({ userId });
     if (!listings || listings.length === 0) {
          return <div className="p-3">No listings found</div>
     }
     return (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 p-3">
               {listings.map((listing) => (
                    <Link href={`/products/${listing.slug}`} className="cursor-pointer">
                         <Card>
                              <Image
                                   src={listing.images[0]!.url}
                                   alt={listing.slug}
                                   width={180} height={150}
                                   className="h-40 w-full object-cover"
                              />
                              <div className='flex justify-between p-2'>
                                   <p className="font-semibold truncate">{listing.model.name}</p>
                                   <p className="font-semibold">₹ {listing.price}</p>
                              </div>
                         </Card>
                    </Link>
               ))}
          </div >
     )
}

export default UserListings
