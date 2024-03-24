"use client";

import Link from "next/link";
import { type ProductsPayloadIncluded } from "@/types/prisma";
import Image from "next/image";
import { useState } from "react";
import { api } from "@/trpc/react";
import { motion } from "framer-motion";
import { HeartSolid } from "./navbar/Icons";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  product: ProductsPayloadIncluded & { isFavorite?: boolean };
  refresh?: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ product }) => {
  const { mutate: add } = api.product.addToFavorites.useMutation();
  const { mutate: remove } = api.product.removeFromFavorites.useMutation();

  const [isFav, setIsFav] = useState(product.isFavorite ?? false);

  const toggle = async () => {
    if (isFav) remove({ productId: product.id });
    else add({ productId: product.id });
    setIsFav(!isFav);
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
      className="relative flex w-full flex-col"
    >
      { product.isFavorite !== undefined &&
      <div onClick={toggle} className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center">
          <HeartSolid className={cn(
            "w-5 h-5 text-red-600",
            isFav ? "text-red-600" : "text-gray-400"
          )} />
      </div> }
      <Link href={`/products/${product.slug}`} className="group cursor-pointer">
        <div className="aspect-square w-full overflow-hidden rounded-xl border shadow-md transition-shadow duration-300 ease-in-out group-hover:shadow-lg">
          <Image
            alt={product.slug}
            src={product.images[0]?.url ?? "https://via.placeholder.com/150"}
            className="h-full w-full rounded-xl object-cover"
            width={180}
            height={150}
          />
        </div>
        <div className="px-2">
          <p className="truncate text-lg font-semibold">{product.model.name}</p>
          <p className="font-semibold">₹ {product.price.toLocaleString("en-in")}</p>
        </div>
      </Link>
    </motion.div>
  );
};

export default ListingCard;
