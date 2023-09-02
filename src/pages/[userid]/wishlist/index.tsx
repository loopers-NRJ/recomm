import { NextPage } from "next";
import AddWish from "@/components/AddWish";
import WishCard from "@/components/WishCard";
import { api } from "@/utils/api";
import { useRouter } from "next/router";
import Container from "@/components/Container";
import { useEffect } from "react";
import Heading from "@/components/Heading";

const WishList: NextPage = () => {
  const router = useRouter();
  const userId = router.query.userid as string;
  const {
    data: wishes,
    isLoading,
    refetch,
  } = api.user.getMywishesById.useQuery({ userId });

  useEffect(() => {
    void refetch();
  }, [refetch]);

  if (isLoading) return <div>Loading...</div>;

  if (wishes instanceof Error) return <div>Something went wrong</div>;
  if (!wishes || wishes.length === 0) return <div>No data to Show</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <Container>
      <Heading title="Your WishList"></Heading>
      <AddWish></AddWish>
      <div className="mt-10 flex w-full flex-col items-center gap-5">
        <div className="list w-full space-y-3">
          {wishes.map((wish) => (
            <WishCard key={wish.id} wish={wish} />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default WishList;
