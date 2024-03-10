import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import UserListings from "./user-listings";
import { Suspense } from "react";
import LogoutButton from "./logout";
import Link from "next/link";

interface ProfilePageParams {
  userId: string;
}

const ProfilePage = AuthenticatedPage<ProfilePageParams>(async ({ params, session }) => {
  const { userId } = params;
  const userData = await api.user.byId.query({ userId });
  const { user: currentUser } = session;
  if (userData === "User not found") {
    return notFound();
  }

  return (
    <Container>
      <main>
        <header className="flex h-full w-full items-center justify-center p-3">
          <Avatar className="h-32 w-32 border shadow-sm">
            <AvatarImage src={userData.image ?? undefined} />
            <AvatarFallback>
              <UserIcon className="h-full w-full p-4" />
            </AvatarFallback>
          </Avatar>
          <div className="flex h-full w-full flex-col gap-3 p-4">
            <div>
              <h1 className="text-xl font-semibold">{userData.name}</h1>
              <p className="text-sm font-medium text-muted-foreground">
                {userData.email}
              </p>
            </div>
            <div className="flex gap-2">
              {currentUser && currentUser.id === userData.id ? (
                <>
                  <Button size="sm" asChild>
                    <Link href={`/user/${currentUser.id}/profile/update`}>
                      Edit Profile
                    </Link>
                  </Button>
                  <LogoutButton />
                </>
              ) : (
                <Button asChild><Link href="https://wa.me/7397379958">Contact Seller</Link></Button>
              )}
            </div>
          </div>
        </header>
        <section className="mb-20 mt-10 text-center">
          <h2 className="p-3 font-medium">Product Listings</h2>
          <Suspense fallback={<ListLoading />}>
            <UserListings userId={userId} session={session} />
          </Suspense>
        </section>
      </main>
    </Container>
  );
});

function ListLoading() {
  return (
    <Container className="flex h-52 w-full items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin" />
    </Container>
  );
}

export default ProfilePage;
