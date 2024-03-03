"use client"

import React from 'react'
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductsPayloadIncluded } from '@/types/prisma';
import { api } from '@/trpc/react';
import toast from 'react-hot-toast';

interface ProductCardProps {
     active: boolean;
     listing: ProductsPayloadIncluded;
     showSwitch: boolean;
}

function ProductCard({ active, listing, showSwitch }: ProductCardProps) {
     const { mutate: changeStatus, data, isLoading } = api.product.update.useMutation();
     const [isActive, setIsActive] = React.useState(active);

     const change = (id: string, active: boolean) => {
          changeStatus({ id, active });
          if(!isLoading && typeof data === 'string') toast.error(data);
          else setIsActive(active);
     }

     return (
          <Card className='relative overflow-clip'>
               { showSwitch &&
                    <Switch
                         checked={isActive}
                         onCheckedChange={(active) => change(listing.id, active)}
                         className="absolute top-2 right-2"
                    />
               }
               <Link href={`/products/${listing.slug}`} className="cursor-pointer">
                    <Image
                         src={listing.images[0]!.url}
                         alt={listing.slug}
                         width={180} height={150}
                         className="h-40 w-full object-cover"
                    />
                    <div className='grid grid-cols-2 p-2'>
                         <p className="font-semibold text-left truncate">{listing.model.name}</p>
                         <p className="font-semibold text-right">₹ {listing.price}</p>
                    </div>
               </Link>
          </Card>
     )
}

export default ProductCard
