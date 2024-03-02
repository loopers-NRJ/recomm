"use client"

import Link from "next/link";
import { type ProductsPayloadIncluded } from "@/types/prisma";
import Image from "next/image";
import HeartUI from "./heart";
import { Fragment, useState } from "react";
import { api } from "@/trpc/react";
import { refreshFavs } from "@/server/actions";
import { useRouter } from "next/navigation";

interface ListingCardProps {
  product: ProductsPayloadIncluded;
  heart: boolean;
  refresh?: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ product, heart }) => {

  const { mutate: add } = api.product.addToFavorites.useMutation();
  const { mutate: remove } = api.product.removeFromFavorites.useMutation();
  const router = useRouter();

  const [isFav, setIsFav] = useState(heart);

  const toggle = async () => {
    if (isFav) remove({ productId: product.id });
    else add({ productId: product.id });
    setIsFav(!isFav);
    await refreshFavs();
    router.refresh();
  };

  return (
    <div className="relative flex w-full flex-col">
      <div onClick={toggle}>
        <HeartUI clicked={isFav.toString()} />
      </div>
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
