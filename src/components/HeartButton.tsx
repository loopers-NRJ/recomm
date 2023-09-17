"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

import useLoginModal from "@/hooks/useLoginModal";
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

  useEffect(() => {
    setHasFavourited(enabled ?? false);
  }, [enabled]);

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
    [
      addToFavourite,
      hasFavorited,
      loginModal,
      onChange,
      productId,
      removeFromFavourite,
      session?.data?.user,
    ]
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
      <div className="heart-icon">
        <svg
          className="heart h-6 w-6 text-red-500"
          fill={hasFavorited ? "currentColor" : "none"}
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      </div>
    </div>
  );
};

export default HeartButton;
