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
    <div className="fixed bottom-0 left-0 z-30 flex w-full border p-0 md:hidden">
      <NavItems currentUser={user}></NavItems>
    </div>
  );
};

export default BottomBar;
