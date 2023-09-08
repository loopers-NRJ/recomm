import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const ProfilePage: NextPage = () => {
  const router = useRouter();
  const userId = router.query.userid as string;

  const session = useSession();
  const user = session.data?.user;

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
      <main>
        Not your profile <br />
        <Button variant={"default"} onClick={() => void signIn()}>
          Log In
        </Button>
      </main>
    );
  }

  return (
    <main>
      This is the profile page of user {userId} <br />
      Your Name: {userData.name} <br />
      Your Email: {userData.email} <br />
      <Button
        variant={"outline"}
        onClick={() => void signOut({ callbackUrl: "/" })}
      >
        Log Out
      </Button>
    </main>
  );
};
export default ProfilePage;
