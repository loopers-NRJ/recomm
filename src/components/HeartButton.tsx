/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

import { useCallback, useState } from "react";
import useLoginModal from "@/hooks/useLoginModal";
import { Toggle } from "@/components/ui/toggle";
import { useSession } from "next-auth/react";
// import { api } from "@/utils/api";

interface HeartButtonProps {
  listingId: string;
}

// const setFavourite = async (listingId: string, userId: string) => {

//     api.user.

// }

const HeartButton: React.FC<HeartButtonProps> = ({ listingId }) => {
  const [hasFavorited, setHasFavourited] = useState(false);
  const loginModal = useLoginModal();
  const session = useSession();
  const toggleFavourite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (session?.data?.user) {
        // toggle favourite
        console.log(listingId);

        setHasFavourited(!hasFavorited);
      } else {
        // show sign in modal
        loginModal.onOpen();
      }
    },
    [hasFavorited, session]
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
