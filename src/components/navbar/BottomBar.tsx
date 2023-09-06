/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { User } from "next-auth";

import NavItems from "./NavItems";
import { FC } from "react";
import { useSession } from "next-auth/react";

interface BottomBarProps {
  className?: string;
}

const BottomBar: FC<BottomBarProps> = () => {
  const user = useSession().data?.user as User;

  return (
    <div className="fixed bottom-3 left-0 z-50 flex w-full items-center justify-center md:hidden">
      <div className="rounded-full border">
        <NavItems currentUser={user}></NavItems>
      </div>
    </div>
  );
};

export default BottomBar;
