import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import useLoginModal from "@/hooks/useLoginModal";
import { api } from "@/utils/api";
import { NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/router";

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const userId = router.query.userid as string;

  const session = useSession();
  const user = session.data?.user;

  const loginModal = useLoginModal();

  const {
    data: userData,
    isLoading,
    isError,
  } = api.user.getUserById.useQuery({ userId });

  if (isLoading) {
    return <main>Loading...</main>;
  } else if (isError) {
    return <main>Something went Wrong</main>;
  } else if (userData instanceof Error) {
    return <main>{userData.message}</main>;
  } else if (!userData) {
    return <main>User not found</main>;
  }

  if (user?.id !== userId) {
    return (
      <Container>
        <main className="mt-[50%] flex flex-col items-center justify-center gap-10 md:mt-[10%]">
          Not your profile <br />
          <Button variant={"default"} onClick={loginModal.onOpen}>
            Log In
          </Button>
        </main>
      </Container>
    );
  }

  return (
    <main>
      <div className="container mx-auto my-24">
        <div>
          <div className="relative mx-auto w-full rounded-lg bg-white shadow md:w-5/6 lg:w-4/6 xl:w-3/6">
            <div className="flex justify-center">
              <Image
                width={128}
                height={128}
                src={userData.image ?? "/placeholder.jpg"}
                alt=""
                className="absolute -top-20 mx-auto h-32 w-32 transform rounded-full border-4 border-white shadow-md transition duration-200 hover:scale-110"
              />
            </div>

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
                <a
                  href="#"
                  className="col-span-1 block rounded-lg bg-gray-900 px-6 py-3 text-center font-medium leading-6 text-gray-200 hover:bg-black hover:text-white"
                >
                  Edit Profile
                </a>
                <a
                  onClick={() => void signOut({ callbackUrl: "/" })}
                  className="col-span-1 block cursor-pointer rounded-lg bg-gray-900 px-6 py-3 text-center font-medium leading-6 text-gray-200 hover:bg-black hover:text-white"
                >
                  Log Out
                </a>
              </div>

              <div className="w-full">
                <h3 className="px-6 text-center font-medium text-gray-900">
                  User Info
                </h3>
                <div className="mt-5 flex w-full flex-col items-center overflow-hidden text-sm">
                  <a
                    onClick={() => void router.push(`/${userId}/favourites`)}
                    className=" block w-full border-t border-gray-100 py-4 pl-6 pr-3 text-gray-600 transition duration-150 hover:bg-gray-100"
                  >
                    My Favourites
                    {/* TODO */}
                    {/* <span className="text-xs text-gray-500">count of favourites</span> */}
                  </a>

                  <a
                    onClick={() => void router.push(`/${userId}/listings`)}
                    className=" block w-full border-t border-gray-100 py-4 pl-6 pr-3 text-gray-600 transition duration-150 hover:bg-gray-100"
                  >
                    Product Listings
                    {/* TODO */}
                    {/* <span className="text-xs text-gray-500">count of listings</span> */}
                  </a>

                  <a
                    onClick={() => void router.push(`/${userId}/wishlist`)}
                    className=" block w-full border-t border-gray-100 py-4 pl-6 pr-3 text-gray-600 transition duration-150 hover:bg-gray-100"
                  >
                    WishList
                    {/* TODO */}
                    {/* <span className="text-xs text-gray-500">count of wishes</span> */}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
export default ProfilePage;
