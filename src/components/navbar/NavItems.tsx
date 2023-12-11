import { usePathname } from "next/navigation";
import { useRouter } from "next/router";
import { FC } from "react";

import useLoginModal from "@/hooks/useLoginModal";

import { Button } from "../ui/button";
import { Session } from "next-auth";
import Link from "next/link";
import {
  HomeSolid,
  HomeOutline,
  HeartSolid,
  HeartOutline,
  StarSolid,
  StarOutline,
  CoinSolid,
  CoinOutline,
} from "./Icons";

interface NavItemsProps {
  session: Session | null;
}

const NavItems: FC<NavItemsProps> = ({ session }) => {
  const router = useRouter();
  const loginModal = useLoginModal();
  const path = usePathname();
  const currentUser = session?.user;

  const onPost = () => {
    if (!currentUser) {
      return loginModal.onOpen();
    } else {
      return void router.push("/sell");
    }
  };

  const handleWishListClick = () => {
    if (!currentUser) {
      return loginModal.onOpen();
    } else {
      return router.push(`/wishlist`);
    }
  };

  const HomeIcon = path === "/" ? <HomeSolid /> : <HomeOutline />;
  const HeartIcon = path === "/favourites" ? <HeartSolid /> : <HeartOutline />;
  const WishListIcon = path === "/wishlist" ? <StarSolid /> : <StarOutline />;
  const SellIcon = path === "/sell" ? <CoinSolid /> : <CoinOutline />;

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

      {session?.user && (
        <Link href="/favourites">
          <Button
            variant="ghost"
            className={`h-full w-full min-w-max flex-col justify-between rounded-lg px-4 md:flex-row md:px-4 md:py-2 ${
              path === `/favourites`
                ? "rounded-b-none border-b-2 border-b-black md:rounded-md md:border-none md:bg-slate-200/50"
                : ""
            }
        `}
            // onClick={() => void router.push(`/favourites`)}
          >
            <span className="text-xl md:hidden">{HeartIcon}</span>
            <span className="text-xs md:text-sm">Favourites</span>
          </Button>
        </Link>
      )}

      <Button
        variant="ghost"
        className={`h-full w-full min-w-max flex-col justify-between rounded-lg px-4 md:flex-row md:px-4 md:py-2 ${
          path === `/wishlist`
            ? "rounded-b-none border-b-2 border-b-black md:rounded-md md:border-none md:bg-slate-200/50"
            : ""
        }
        `}
        onClick={() => void handleWishListClick()}
      >
        <span className="text-xl md:hidden">{WishListIcon}</span>
        <span className="text-xs md:text-sm">Wish It</span>
      </Button>

      <Button
        variant={"ghost"}
        className="h-full w-full min-w-max flex-col justify-between rounded-lg px-4 md:flex-row md:px-4 md:py-2"
        onClick={onPost}
      >
        <span className="text-xl md:hidden">{SellIcon}</span>
        <span className="text-xs md:text-sm">Sell It</span>
      </Button>
    </div>
  );
};
export default NavItems;
