"use client";

import type { ReactNode, FC } from "react";
import { type Session } from "next-auth";
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
import { usePathname } from "next/navigation";
import { ButtonLink } from "../common/ButtonLink";

interface NavItemsProps {
  session: Session | null;
  children?: ReactNode;
}

const NavItems: FC<NavItemsProps> = ({ session, children: AdminButton }) => {
  const currentUser = session?.user;
  const pathname = usePathname();
  const HomeIcon = pathname === "/" ? <HomeSolid /> : <HomeOutline />;
  const HeartIcon =
    pathname === "/favourites" ? <HeartSolid /> : <HeartOutline />;
  const WishListIcon =
    pathname === "/wishlist" ? <StarSolid /> : <StarOutline />;
  const SellIcon = pathname === "/sell" ? <CoinSolid /> : <CoinOutline />;

  return (
    <div className="flex h-14 w-full flex-row items-center justify-evenly gap-0 rounded-lg bg-white md:h-fit md:w-fit md:gap-3">
      {AdminButton}
      <ButtonLink
        href="/"
        variant="ghost"
        className={`h-full  w-full min-w-max flex-col justify-between rounded-lg px-6 md:flex-row md:px-4 md:py-2 ${
          pathname === "/"
            ? "rounded-b-none border-b-2 border-b-black md:rounded-lg md:border-none md:bg-slate-200/50"
            : ""
        }`}
      >
        <span className="text-xl md:hidden">{HomeIcon}</span>
        <span className="text-xs md:text-sm">Home</span>
      </ButtonLink>
      <ButtonLink
        href={!currentUser ? "/login" : "/favourites"}
        variant="ghost"
        className={`h-full w-full min-w-max flex-col justify-between rounded-lg px-4 md:flex-row md:px-4 md:py-2 ${
          pathname === `/favourites`
            ? "rounded-b-none border-b-2 border-b-black md:rounded-lg md:border-none md:bg-slate-200/50"
            : ""
        }
        `}
      >
        <span className="text-xl md:hidden">{HeartIcon}</span>
        <span className="text-xs md:text-sm">Favourites</span>
      </ButtonLink>

      <ButtonLink
        href={!currentUser ? "/login" : "/wishlist"}
        variant="ghost"
        className={`h-full w-full min-w-max flex-col justify-between rounded-lg px-4 md:flex-row md:px-4 md:py-2 ${
          pathname === `/wishlist`
            ? "rounded-b-none border-b-2 border-b-black md:rounded-lg md:border-none md:bg-slate-200/50"
            : ""
        }
        `}
      >
        <span className="text-xl md:hidden">{WishListIcon}</span>
        <span className="text-xs md:text-sm">Wish It</span>
      </ButtonLink>

      <ButtonLink
        href={!currentUser ? "/login" : "/sell"}
        variant="ghost"
        className="h-full w-full min-w-max flex-col justify-between rounded-lg px-4 md:flex-row md:px-4 md:py-2"
      >
        <span className="text-xl md:hidden">{SellIcon}</span>
        <span className="text-xs md:text-sm">Sell It</span>
      </ButtonLink>
    </div>
  );
};
export default NavItems;
