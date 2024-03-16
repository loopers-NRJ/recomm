"use client"
import { api } from '@/trpc/react'
import type { ProductsPayloadIncluded } from '@/types/prisma'
import { MapPin } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function MapInteraction({os, product}: {os: string | null, product: ProductsPayloadIncluded } ) {

  const { data: address } = api.address.byId.useQuery({ id: product.addressId ?? "" })
  if (!address) return null
  
  const location = () => {
    const details = [
      address.addressLine1 ?? "",
      address.addressLine2 ?? "",
      address.city ?? "",
      address.state ?? "",
      address.country ?? "",
      address.postalCode ?? "",
    ]
    if(os === "Android"){
      return `geo:0,0?q=${details.join("+")}`
    } else if (os == "iOS") return `http://maps.apple.com/?q=${details.join("+")}`
    return `https://www.google.com/maps/search/?api=1&query=${details.join("+")}`
  }

  return (
    <Link href={location()} target='_blank' rel='noopener'>
      <MapPin />
    </Link>
  )
}

export default MapInteraction
