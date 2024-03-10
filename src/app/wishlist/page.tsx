import AddWish from "./add-wish";
import Container from "@/components/Container";
import AuthenticatedPage from "@/hoc/AuthenticatedPage";

import { api } from "@/trpc/server";
import List from "./list";

const WishesPage = async () => {
  const { wishes } = await api.user.wishes.query({});

  if (wishes.length === 0) {
    return (
      <Container>
        <header className="mt-5 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Your WishList</h1>
          <AddWish />
        </header>
        <div className="flex h-[300px] w-full items-center justify-center">
          No Data Available
        </div>
      </Container>
    );
  }
  return (
    <Container>
      <header className="mt-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your WishList</h1>
        <AddWish />
      </header>
      <List wishes={wishes} />
    </Container>
  );
};

export default AuthenticatedPage(WishesPage, "/wishlist");
