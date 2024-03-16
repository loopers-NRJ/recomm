"use client";

import { type FC } from "react";
import { ButtonLink } from "@/components/common/ButtonLink";
import { usePathname } from "next/navigation";
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

interface BottomBarProps {
  className?: string;
}

const BottomBar: FC<BottomBarProps> = () => {
  const pathname = usePathname();

  const HomeIcon = pathname === "/" ? <HomeSolid /> : <HomeOutline />;
  const HeartIcon =
    pathname === "/favourites" ? <HeartSolid /> : <HeartOutline />;
  const WishListIcon =
    pathname === "/wishlist" ? <StarSolid /> : <StarOutline />;
  const SellIcon = pathname === "/sell" ? <CoinSolid /> : <CoinOutline />;

  const highlight =
    "rounded-b-none border-b-2 border-b-black md:rounded-lg md:border-none md:bg-slate-200/50";

  return (
    <div className="bottom-bar fixed bottom-0 left-0 z-30 flex w-full border bg-white p-0">
      <ButtonLink
        href="/"
        variant="ghost"
        className={`${pathname === "/" ? highlight : ""} rounded-none`}
      >
        <span className="text-xl">{HomeIcon}</span>
        <span className="text-xs md:text-sm">Home</span>
      </ButtonLink>
      <ButtonLink
        href="/favourites"
        variant="ghost"
        className={`${pathname === "/favourites" ? highlight : ""} rounded-none`}
      >
        <span className="text-xl">{HeartIcon}</span>
        <span className="text-xs md:text-sm">Favourites</span>
      </ButtonLink>

      <ButtonLink
        href="/wishlist"
        variant="ghost"
        className={`${pathname === "/wishlist" ? highlight : ""} rounded-none`}
      >
        <span className="text-xl">{WishListIcon}</span>
        <span className="text-xs md:text-sm">Wish It</span>
      </ButtonLink>

      <ButtonLink
        href="/sell"
        variant="ghost"
        className={`${pathname === "/sell" ? highlight : ""} rounded-none`}
      >
        <span className="text-xl">{SellIcon}</span>
        <span className="text-xs md:text-sm">Sell It</span>
      </ButtonLink>
    </div>
  );
};

export default BottomBar;
