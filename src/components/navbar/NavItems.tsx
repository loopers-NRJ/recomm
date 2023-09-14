import { Home } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { FC, useCallback } from "react";
import { RiCopperCoinLine, RiHeartLine } from "react-icons/ri";

import useLoginModal from "@/hooks/useLoginModal";
import usePostingModal from "@/hooks/usePostingModal";

import { Button } from "../ui/button";
import Avatar from "./Avatar";

interface NavItemsProps {
  currentUser?: {
    id: string;
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
}

const NavItems: FC<NavItemsProps> = ({ currentUser }) => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const postingModal = usePostingModal();
  const { data: session } = useSession();
  const path = usePathname();

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
    <div className="flex w-fit flex-row items-center gap-0 rounded-lg bg-white md:gap-3">
      <Button
        variant={"ghost"}
        className={`min-w-max rounded-lg px-4 py-6 md:px-4 md:py-2 ${
          path === "/" ? `bg-slate-200/50` : ""
        }`}
        onClick={() => void router.push("/")}
      >
        <span className="text-xl md:hidden">
          <Home height={20} />
        </span>
        <span className="hidden md:block">Home</span>
      </Button>

      <Button
        variant={"ghost"}
        className="min-w-max rounded-lg px-4 py-6 md:px-4 md:py-2"
        onClick={onPost}
      >
        <span className="text-xl md:hidden">
          <RiCopperCoinLine />
        </span>
        <span className="hidden md:block">Sell It</span>
      </Button>

      <Button
        variant={"ghost"}
        className={`min-w-max rounded-lg px-4 py-6 md:px-4 md:py-2
        ${path === `/${session?.user.id}/wishlist` ? "bg-slate-200/50" : ""}
        `}
        onClick={() => void handleWishListClick()}
      >
        <span className="text-xl md:hidden">
          <RiHeartLine />
        </span>
        <span className="hidden md:block">Wish It</span>
      </Button>

      <Button
        className={`min-w-max rounded-lg px-4 py-6 md:gap-2 md:px-4 md:py-2 ${
          path === `/${session?.user.id}/profile` ? "bg-slate-200/50" : ""
        }`}
        variant={"ghost"}
        onClick={() => void handleProfileClick()}
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
