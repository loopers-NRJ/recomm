import { RiCopperCoinLine } from "react-icons/ri";
import { Button } from "../ui/button";
import { BiHeart } from "react-icons/bi";
import Avatar from "./Avatar";
import usePostingModal from "@/hooks/usePostingModal";
import useLoginModal from "@/hooks/useLoginModal";
import { FC, useCallback } from "react";

import { User } from "next-auth";
import { useRouter } from "next/navigation";

interface NavItemsProps {
  currentUser: User | null;
}

const NavItems: FC<NavItemsProps> = ({ currentUser }) => {
  const router = useRouter();

  const loginModal = useLoginModal();
  const postingModal = usePostingModal();

  const onPost = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    } else {
      return postingModal.onOpen();
    }
  }, [currentUser, loginModal, postingModal]);

  const handleWishListClick = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    } else {
      return router.push(`/${currentUser.id}/wishlist`);
    }
  }, [currentUser, loginModal, router]);

  const handleProfileClick = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    } else {
      return router.push(`/${currentUser.id}/profile`);
    }
  }, [currentUser, loginModal, router]);

  return (
    <div className="flex w-fit flex-row items-center gap-3 rounded-full bg-white px-3 py-2">
      <Button
        variant={"ghost"}
        className="min-w-max rounded-full"
        onClick={onPost}
      >
        <span className="text-xl md:hidden">
          <RiCopperCoinLine />
        </span>
        <span className="hidden md:block">Sell It</span>
      </Button>

      <Button
        variant={"ghost"}
        onClick={handleWishListClick}
        className="min-w-max rounded-full"
      >
        <span className="text-xl md:hidden">
          <BiHeart />
        </span>
        <span className="hidden md:block">Wish It</span>
      </Button>

      <Button
        className="min-w-max gap-2 rounded-full"
        onClick={handleProfileClick}
        variant={"ghost"}
      >
        <div>
          <Avatar src={currentUser?.image} />
        </div>
        <span className="hidden md:block">Profile</span>
      </Button>
    </div>
  );
};
export default NavItems;
