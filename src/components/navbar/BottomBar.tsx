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
    <div className="fixed bottom-0 left-0 z-30 flex w-full border p-0 md:hidden">
      <NavItems currentUser={user} />
    </div>
  );
};

export default BottomBar;
