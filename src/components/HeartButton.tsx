/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

import { User } from "next-auth";
import { useCallback, useState } from "react";
import useLoginModal from "@/hooks/useLoginModal";
import { Toggle } from "@/components/ui/toggle";
// import { api } from "@/utils/api";

interface HeartButtonProps {
  listingId: string;
  currentUser?: User | null;
}

// const setFavourite = async (listingId: string, userId: string) => {

//     api.user.

// }

const HeartButton: React.FC<HeartButtonProps> = ({
  listingId,
  currentUser,
}) => {
  const [hasFavorited, setHasFavourited] = useState(false);
  const loginModal = useLoginModal();

  const toggleFavourite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentUser) {
        // toggle favourite
        console.log(listingId);

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
      <AiOutlineHeart className="fill-white" size={28}>
        {hasFavorited && (
          <AiFillHeart
            size={24}
            className="text-red-500 shadow-sm outline-2 outline-white"
          />
        )}
      </AiOutlineHeart>
    </Toggle>
  );
};

export default HeartButton;
