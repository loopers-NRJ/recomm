/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

import { useCallback, useState } from "react";
import useLoginModal from "@/hooks/useLoginModal";
// import { Toggle } from "@/components/ui/toggle";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";

interface HeartButtonProps {
  enabled?: boolean;
  productId: string;
  onChange?: () => void;
}

const HeartButton: React.FC<HeartButtonProps> = ({
  productId,
  enabled,
  onChange,
}) => {
  const [hasFavorited, setHasFavourited] = useState(enabled ?? false);
  const loginModal = useLoginModal();
  const session = useSession();

  const addToFavourite = api.product.addProductToFavorites.useMutation();
  const removeFromFavourite =
    api.product.removeProductFromFavorites.useMutation();

  const toggleFavourite = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();

      if (session?.data?.user) {
        // toggle favourite
        setHasFavourited(!hasFavorited);
        if (!hasFavorited) {
          // add to favourites
          await addToFavourite.mutateAsync({ productId });
        } else {
          // remove from favourites
          await removeFromFavourite.mutateAsync({ productId });
        }
        if (onChange) {
          onChange();
        }
      } else {
        // show sign in modal
        loginModal.onOpen();
      }
    },
    [hasFavorited, session]
  );

  return (
    <div
      onClick={(e) => {
        void toggleFavourite(e);
      }}
      defaultChecked
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
    </div>
  );
};

export default HeartButton;