import Image from "next/image";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import LogoutButton from "./logout";

async function ProfilePage() {
  const session = await getServerAuthSession();
  if (!session || !session.user) {
    redirect("/login")
  }
  const userId = session.user.id

  const userData = await api.user.getUserById.query({userId})

  return (
    <div className="relative mx-auto w-full rounded-lg bg-white shadow md:w-5/6 lg:w-4/6 xl:w-3/6">
      <Image
        width={128}
        height={128}
        src={userData.image ?? "/placeholder.jpg"}
        alt=""
        className="mx-auto h-32 w-32 transform rounded-full border-4 border-white shadow-md transition duration-200 hover:scale-110" />

      <div className="mt-16 w-full">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          {userData.name ?? "User Name"}
        </h1>
        <p className="text-center text-sm font-medium text-gray-400">
          @{userData.email}
        </p>
        <p>
          <span></span>
        </p>
        <div className="my-5 grid grid-flow-col grid-cols-2 grid-rows-1 space-x-2 px-6">
          <Button
            className="col-span-1 block rounded-lg bg-gray-900 px-6 py-3 text-center font-medium leading-6 text-gray-200 hover:bg-black hover:text-white"
          >
            Edit Profile
          </Button>
          <LogoutButton/>
        </div>

        <div className="w-full">
          <h3 className="px-6 text-center font-medium text-gray-900">
            User Info
          </h3>
          <div className="mt-5 flex w-full flex-col items-center overflow-hidden text-sm">
            <a
              href={`/favourites`}
              className=" block w-full border-t border-gray-100 py-4 pl-6 pr-3 text-gray-600 transition duration-150 hover:bg-gray-100"
            >
              My Favourites
            </a>

            <a
              href={`/users/${userId}/listings`}
              className=" block w-full border-t border-gray-100 py-4 pl-6 pr-3 text-gray-600 transition duration-150 hover:bg-gray-100"
            >
              Product Listings
            </a>

            <a
              href={`/wishlist`}
              className=" block w-full border-t border-gray-100 py-4 pl-6 pr-3 text-gray-600 transition duration-150 hover:bg-gray-100"
            >
              WishList
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AuthenticatedPage(ProfilePage);
