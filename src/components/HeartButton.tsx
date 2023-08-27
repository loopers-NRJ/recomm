/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

import { User } from "next-auth";
import { useCallback, useState } from "react";
import useLoginModal from "@/hooks/useLoginModal";
import { Toggle } from "@/components/ui/toggle";
import { api } from "@/utils/api";

interface HeartButtonProps {
  enabled?: boolean;
  productId: string;
  currentUser?: User | null;
}

const HeartButton: React.FC<HeartButtonProps> = ({
  enabled,
  productId,
  currentUser,
}) => {
  const [hasFavorited, setHasFavourited] = useState(enabled);
  const loginModal = useLoginModal();

  const addToFavourite = api.product.addProductToFavorites.useMutation();
  const removeFromFavourite =
    api.product.removeProductFromFavorites.useMutation();

  const toggleFavourite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (currentUser) {
        if (!hasFavorited) {
          // add to favourites
          addToFavourite.mutate({ productId });
        } else {
          // remove from favourites
          removeFromFavourite.mutate({ productId });
        }
        // toggle favourite
        setHasFavourited(!hasFavorited);
      } else {
        // show sign in modal
        loginModal.onOpen();
      }
    },
    [hasFavorited, currentUser]
  );

  return (
    <Toggle
      onClick={(e) => {
        toggleFavourite(e);
      }}
      size="lg"
      className="
        absolute
        right-[2px]
        top-[2px]
        cursor-pointer
        transition
        hover:opacity-80
      "
    >
      {hasFavorited ? (
        <AiFillHeart
          size={28}
          className="text-red-500 shadow-sm outline-2 outline-white"
        />
      ) : (
        <AiOutlineHeart className="fill-white" size={28} />
      )}
    </Toggle>
  );
};

export default HeartButton;
