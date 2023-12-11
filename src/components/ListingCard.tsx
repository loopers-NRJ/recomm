"use client";

import Link from "next/link";

import { ProductsPayloadIncluded } from "@/types/prisma";

// import Image from "next/image";
import Carousel from "./common/Carousel";
import HeartButton from "./HeartButton";

interface ListingCardProps {
  isFavourite?: boolean;
  product: ProductsPayloadIncluded;
  onFavoriteStateChange?: () => void;
  hideHeartIcon?: true;
}

const ListingCard: React.FC<ListingCardProps> = ({
  product,
  isFavourite,
  onFavoriteStateChange,
  hideHeartIcon = false,
}) => {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group col-span-1 cursor-pointer"
    >
      <div className="flex w-full flex-col gap-2">
        <div className="relative w-full overflow-hidden rounded-xl">
          <Carousel images={product.images} />
          <div className="absolute right-3 top-3">
            {!hideHeartIcon && (
              <HeartButton
                productId={product.id}
                enabled={isFavourite ?? false}
                onChange={onFavoriteStateChange}
              />
            )}
          </div>
        </div>
        <div className="text-lg font-semibold">{product.model.name}</div>
        <div className="flex flex-row items-center gap-1">
          <div className="font-semibold">$ {product.price}</div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
