import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import { api } from "@/trpc/server";
import {
  defaultSearch,
  SortBy,
  defaultSortBy,
  SortOrder,
  defaultSortOrder,
} from "@/utils/constants";

import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import { NextPage } from "next";

interface FavouritePageParams {
  params: {
    search: string;
    sortBy: SortBy;
    sortOrder: SortOrder;
  }
}

const Favourites: NextPage<FavouritePageParams> = async ({ params }) => {

  const search = params.search ?? defaultSearch;
  const sortBy = params.sortBy ?? defaultSortBy;
  const sortOrder = params.sortOrder ?? defaultSortOrder;

  const { favoritedProducts } = await api.user.getMyFavorites.query(
    {
      search,
      sortBy,
      sortOrder,
    }
  );

  if (favoritedProducts.length === 0) {
    return (
      <Container>
        <div className="flex h-[500px] items-center justify-center font-semibold">
          No Products Available
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6">
        {favoritedProducts.map((product) => (
          <ListingCard
            key={product.id}
            product={product}
            isFavourite
          />
        ))}
      </div>
    </Container>
  );
}

export default AuthenticatedPage(Favourites);
