import { api } from '@/trpc/server';
import type { Session } from 'next-auth';
import React from 'react'
import ProductCard from './product-card';
import toast from 'react-hot-toast';


async function UserListings({ userId, session }: { userId: string, session: Session }) {

     const { listings } = await api.user.listingsById.query({ userId });
     if (!listings || listings.length === 0) {
          return <div className="p-3">No listings found</div>
     }

     return (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 p-3">
               {listings.map((listing) => (
                    <ProductCard
                         key={listing.id}
                         listing={listing}
                         active={listing.active}
                         showSwitch={session.user?.id === userId}
                    />
               ))}
          </div >
     )
}

export default UserListings
