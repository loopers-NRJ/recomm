/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { useSession } from "next-auth/react";
import { FC } from "react";

import NavItems from "./NavItems";

interface BottomBarProps {
  className?: string;
}

const BottomBar: FC<BottomBarProps> = () => {
  const user = useSession().data?.user;

  return (
    <div className="fixed bottom-4 left-0 z-30 flex w-full items-center justify-center md:hidden">
      <div className="rounded-lg border bg-white shadow-sm">
        <NavItems currentUser={user} />
      </div>
    </div>
  );
};

export default BottomBar;
