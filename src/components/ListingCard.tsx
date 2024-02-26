"use client"

import Link from "next/link";
import { type ProductsPayloadIncluded } from "@/types/prisma";
import Image from "next/image";
import HeartUI from "./heart";
import { useState } from "react";
import { api } from "@/trpc/react";
import { refreshFavs } from "@/server/actions";
import { useRouter } from "next/navigation";

interface ListingCardProps {
  product: ProductsPayloadIncluded;
  heart: "fav" | 'not-fav' | 'not-show';
}

const ListingCard: React.FC<ListingCardProps> = ({ product, heart }) => {

  const { mutate: add } = api.product.addToFavorites.useMutation();
  const { mutate: remove } = api.product.removeFromFavorites.useMutation();
  const router = useRouter();

  const [isFav, setIsFav] = useState(heart === "fav");

  const toggle = () => {
    if (isFav) remove({ productId: product.id });
    else add({ productId: product.id });
    setIsFav(!isFav);
    router.refresh()
    refreshFavs();
  };

  return (
    <div className="relative flex w-full flex-col">
      {heart != "not-show" && <HeartUI onClick={toggle} isClick={isFav} />}
      <Link href={`/products/${product.slug}`} className="group cursor-pointer">
        <div className="aspect-square w-full overflow-hidden rounded-xl border shadow-md transition-shadow duration-300 ease-in-out group-hover:shadow-lg">
          <Image
            alt={product.slug}
            src={product.images[0]!.url}
            className="h-full w-full rounded-xl object-cover"
            width={180}
            height={150}
          />
        </div>
        <div className="px-2">
          <p className="text-lg font-semibold">{product.model.name}</p>
          <p className="font-semibold">₹ {product.price}</p>
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;
