import AddWish from "./add-wish";
import Container from "@/components/Container";
import AuthenticatedPage from "@/hoc/AuthenticatedPage";

import { api } from "@/trpc/server";
import WishCard from "./wish-card";

// import {
//
//   type SortOrder,
//   defaultSortOrder,
// } from "@/utils/constants";
//
// interface WishesPageParams {
//   search?: string;
//   sortOrder?: SortOrder;
// }

const WishesPage = async () => {
  // const search = searchParams.search ?? "";
  // const sortOrder = (searchParams.sortOrder as SortOrder) ?? defaultSortOrder;
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
      <div className="mt-10 flex w-full flex-col items-center gap-5">
        <div className="list w-full space-y-3">
          {wishes.map((wish) => (
            <WishCard wish={wish} key={wish.id} />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default AuthenticatedPage(WishesPage, "/wishlist");
