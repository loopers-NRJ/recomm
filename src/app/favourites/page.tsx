import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import { api } from "@/trpc/server";
import {
  DEFAULT_SORT_BY,
  type SortOrder,
  DEFAULT_SORT_ORDER,
} from "@/utils/constants";

import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import { type RouterInputs } from "@/trpc/shared";

interface FavouritePageSearchParams {
  search?: string;
  sortBy?: RouterInputs["user"]["favorites"]["sortBy"];
  sortOrder?: SortOrder;
}

const FavouritesPage = AuthenticatedPage<undefined, FavouritePageSearchParams>(
  async ({ searchParams }) => {
    const search = searchParams.search ?? "";
    const sortBy = searchParams.sortBy ?? DEFAULT_SORT_BY;
    const sortOrder = searchParams.sortOrder ?? DEFAULT_SORT_ORDER;

    const { favoritedProducts } = await api.user.favorites.query({
      search,
      sortBy,
      sortOrder,
    });

    if (favoritedProducts.length === 0) {
      return (
        <Container className="mb-32">
          <div className="flex h-[500px] items-center justify-center font-semibold">
            No Products Available
          </div>
        </Container>
      );
    }

    return (
      <Container>
        <div className="product-area mb-32 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
          {favoritedProducts.map((product) => {
            return (
              <ListingCard key={product.id} product={product} heart={true} />
            );
          })}
        </div>
      </Container>
    );
  },
  "/favorites",
);

export default FavouritesPage;
