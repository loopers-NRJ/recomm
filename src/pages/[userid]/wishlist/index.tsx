import { NextPage } from "next";
import AddWish from "@/components/AddWish";
import WishCard from "@/components/WishCard";
import { api } from "@/utils/api";
import Container from "@/components/Container";
import Heading from "@/components/Heading";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

const WishList: NextPage = () => {
  const {
    data: wishes,
    isLoading,
    refetch,
  } = api.user.getMywishes.useQuery({});
  const session = useSession();

  useEffect(() => {
    void refetch();
  }, [refetch, session.status]);

  if (isLoading) return <div>Loading...</div>;
  if (wishes instanceof Error) return <div>Something went wrong</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <Container>
      <Heading title="Your WishList"></Heading>
      <AddWish />
      {!wishes || wishes.length === 0 ? (
        <div>No data to Show</div>
      ) : (
        <div className="mt-10 flex w-full flex-col items-center gap-5">
          <div className="list w-full space-y-3">
            {wishes.map((wish) => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </div>
        </div>
      )}
    </Container>
  );
};

export default WishList;
