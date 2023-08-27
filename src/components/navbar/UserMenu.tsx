/* eslint-disable @typescript-eslint/no-misused-promises */
"use client";

import { useCallback } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import useLoginModal from "@/hooks/useLoginModal";
import useRegisterModal from "@/hooks/useRegisterModal";

import Avatar from "./Avatar";
import { User } from "next-auth";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "../ui/button";

interface UserMenuProps {
  currentUser: User | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
  const router = useRouter();

  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();

  const onPost = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    } else {
      return router.push(`/${currentUser.id}/listings/new`);
    }
  }, [currentUser, loginModal, router]);

  return (
    <div className="relative">
      <div className="flex flex-row items-center gap-3">
        <Button
          variant={"ghost"}
          onClick={onPost}
          className="hidden cursor-pointer rounded-full text-sm font-semibold transition hover:bg-neutral-100 md:block"
        >
          Post a Listing
        </Button>

        {currentUser ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer flex-row items-center gap-3 rounded-full border-[1px] border-neutral-200 p-4 transition hover:shadow-md md:px-2 md:py-1">
              <div className="hidden md:block">
                <Avatar src={currentUser?.image} />
              </div>
              <AiOutlineMenu />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="overflow-hidden rounded-xl bg-white text-sm shadow-md md:w-3/4">
              <div className="w-[15rem]">
                <DropdownMenuLabel>
                  {"Hi, " + currentUser.name ?? "My Account"}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-600/20" />
                <DropdownMenuItem
                  onClick={() => router.push(`/${currentUser.id}/profile`)}
                  className="w-full px-4 py-3 font-semibold transition hover:bg-neutral-100"
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/${currentUser.id}/favourites`)}
                  className="px-4 py-3 font-semibold transition hover:bg-neutral-100"
                >
                  My Favourites
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/${currentUser.id}/bids`)}
                  className="px-4 py-3 font-semibold transition hover:bg-neutral-100"
                >
                  My Bids
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push(`/${currentUser.id}/listings`)}
                  className="px-4 py-3 font-semibold transition hover:bg-neutral-100"
                >
                  My Listings
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onPost}
                  className="cursor-pointer rounded-full px-4 py-3 text-sm font-semibold transition hover:bg-neutral-100 md:hidden"
                >
                  Post a Listing
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="px-4 py-3 font-semibold transition hover:bg-neutral-100"
                >
                  LogOut
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer flex-row items-center gap-3 rounded-full border-[1px] border-neutral-200 p-4 transition hover:shadow-md md:px-2 md:py-1">
              <div className="hidden md:block">
                <Avatar src="/placeholder.jpg" />
              </div>
              <AiOutlineMenu />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="overflow-hidden rounded-xl bg-white text-sm shadow-md md:w-3/4">
              <DropdownMenuItem
                onClick={loginModal.onOpen}
                className="cursor-pointer px-4 py-3 font-semibold transition hover:bg-neutral-100"
              >
                LogIn
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={registerModal.onOpen}
                className="cursor-pointer px-4 py-3 font-semibold transition hover:bg-neutral-100"
              >
                SignUp
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};

export default UserMenu;
