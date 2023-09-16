"use client";

import { useRouter } from "next/router";

import Product from "@/types/product";

// import Image from "next/image";
import Carousel from "./common/Carousel";
// import Button from "./Button";
import HeartButton from "./HeartButton";

interface ListingCardProps {
  isFavourite?: boolean;
  product: Product;
  onFavoriteStateChange?: () => void;
  hideHeartIcon?: true;
}

const ListingCard: React.FC<ListingCardProps> = ({
  product,
  isFavourite,
  onFavoriteStateChange,
  hideHeartIcon = false,
}) => {
  const router = useRouter();

  console.log("images:", product.images);

  return (
    <div
      onClick={() => {
        router.push(`/products/${product.id}/`).catch((err) => {
          console.log(err);
        });
      }}
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
    </div>
  );
};

export default ListingCard;
