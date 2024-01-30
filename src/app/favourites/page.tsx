import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import { api } from "@/trpc/server";
import {
  defaultSearch,
  type SortBy,
  defaultSortBy,
  type SortOrder,
  defaultSortOrder,
} from "@/utils/constants";

import AuthenticatedPage from "@/hoc/AuthenticatedPage";

interface FavouritePageSearchParams {
  search?: string;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

const FavouritesPage = AuthenticatedPage<undefined, FavouritePageSearchParams>(
  async ({ searchParams }) => {
    const search = searchParams.search ?? defaultSearch;
    const sortBy = searchParams.sortBy ?? defaultSortBy;
    const sortOrder = searchParams.sortOrder ?? defaultSortOrder;

    const { favoritedProducts } = await api.user.favorites.query({
      search,
      sortBy,
      sortOrder,
    });

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
          {favoritedProducts.map((product) => {
            return <ListingCard key={product.id} product={{...product, isFav: true}} isUser />
          })}
        </div>
      </Container>
    );
  },
);

export default FavouritesPage;
