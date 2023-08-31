"use client";

import Product from "@/types/product";
// import Button from "./Button";
import HeartButton from "./HeartButton";
import { useRouter } from "next/router";
import Image from "next/image";

interface ListingCardProps {
  isFavourite?: boolean;
  product: Product;
  onFavoriteStateChange?: () => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
  product,
  isFavourite,
  onFavoriteStateChange,
}) => {
  const router = useRouter();

  const pathname = router.pathname;

  return (
    <div
      onClick={() => {
        router.push(`/product/${product.id}/`).catch((err) => {
          console.log(err);
        });
      }}
      className="group col-span-1 cursor-pointer"
    >
      <div className="flex w-full flex-col gap-2">
        <div
          className="
              relative 
              aspect-square 
              w-full 
              overflow-hidden 
              rounded-xl
            "
        >
          <Image
            fill
            className="
                h-full 
                w-full 
                object-cover 
                transition 
                group-hover:scale-110
              "
            src={"/shoe.jpg"}
            alt="Listing"
          />
          <div
            className="
              absolute
              right-3
              top-3
            "
          >
            {pathname !== "/" && (
              <HeartButton
                productId={product.id}
                enabled={isFavourite ?? false}
                onChange={onFavoriteStateChange}
              />
            )}
          </div>
        </div>
        <div className="text-lg font-semibold">{product.model.name}</div>
        <div className="font-light text-neutral-500">{product.description}</div>
        <div className="flex flex-row items-center gap-1">
          <div className="font-semibold">$ {product.price}</div>
        </div>
        {/* {onAction && actionLabel && (
          <Button
            disabled={disabled}
            small
            label={actionLabel}
            onClick={handleCancel}
          />
        )} */}
      </div>
    </div>
  );
};

export default ListingCard;