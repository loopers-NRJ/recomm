import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { FC, useCallback } from "react";

import useLoginModal from "@/hooks/useLoginModal";
import usePostingModal from "@/hooks/usePostingModal";

import { Button } from "../ui/button";
import Avatar from "./Avatar";
import Image from "next/image";

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

  const HomeIcon =
    path === "/" ? (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width={22}
        height={22}
        className="m-[1px]"
      >
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
      </svg>
    ) : (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        width={22}
        height={22}
        className="m-[1px]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    );

  const CoinIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      width={24}
      height={24}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const HeartIcon = (
    <svg
      className="heart m-[2px]"
      fill={path === `/${session?.user.id}/wishlist` ? "currentColor" : "none"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      height="20"
      width="20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );

  return (
    <div className="flex h-14 w-full flex-row items-center justify-evenly gap-0 rounded-lg bg-white md:h-fit md:w-fit md:gap-3">
      <Button
        variant={"ghost"}
        className={`h-full  w-full min-w-max flex-col justify-between rounded-lg px-6 md:flex-row md:px-4 md:py-2 ${
          path === "/"
            ? "rounded-b-none border-b-2 border-b-black md:rounded-md md:border-none md:bg-slate-200/50"
            : ""
        }`}
        onClick={() => void router.push("/")}
      >
        <span className="text-xl md:hidden">{HomeIcon}</span>
        <span className="text-xs md:text-sm">Home</span>
      </Button>

      <Button
        variant={"ghost"}
        className="h-full w-full min-w-max flex-col justify-between rounded-lg px-4 md:flex-row md:px-4 md:py-2"
        onClick={onPost}
      >
        <span className="text-xl md:hidden">{CoinIcon}</span>
        <span className="text-xs md:text-sm">Sell It</span>
      </Button>

      <Button
        variant={"ghost"}
        className={`h-full w-full min-w-max flex-col justify-between rounded-lg px-4 md:flex-row md:px-4 md:py-2
        ${
          path === `/${session?.user.id}/wishlist`
            ? "rounded-b-none border-b-2 border-b-black md:rounded-md md:border-none md:bg-slate-200/50"
            : ""
        }
        `}
        onClick={() => void handleWishListClick()}
      >
        <span className="text-xl md:hidden">{HeartIcon}</span>
        <span className="text-xs md:text-sm">Wish It</span>
      </Button>

      <Button
        className={`h-full w-full min-w-max flex-col justify-between rounded-lg px-4 md:flex-row md:gap-2 md:px-4 md:py-2 ${
          path === `/${session?.user.id}/profile`
            ? "rounded-b-none border-b-2 border-b-black md:rounded-md md:border-none md:bg-slate-200/50"
            : ""
        }`}
        variant={"ghost"}
        onClick={() => void handleProfileClick()}
      >
        <Image
          className="rounded-full"
          height={24}
          width={24}
          alt="Avatar"
          src={currentUser?.image ?? "/placeholder.jpg"}
        />
        <span className="text-xs md:text-sm">Profile</span>
      </Button>
    </div>
  );
};
export default NavItems;
