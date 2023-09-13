import { NextPage } from "next";
import AddWish from "@/components/AddWish";
import { api } from "@/utils/api";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Wishes from "@/components/Wishes";

const WishList: NextPage = () => {
  const session = useSession();
  const {
    data: wishes,
    isLoading,
    refetch,
  } = api.user.getMywishes.useQuery({});

  useEffect(() => {
    void refetch();
  }, [refetch, session.status]);

  if (isLoading) return <div>Loading...</div>;
  if (wishes instanceof Error) return <div>Something went wrong</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <Container>
      <div className="flex justify-between">
        <Heading title="Your WishList"></Heading>
        <AddWish />
      </div>
      <Wishes />
    </Container>
  );
};

export default WishList;
