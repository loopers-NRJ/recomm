import Container from "@/components/Container";
import { api } from "@/trpc/server";
import {
  DEFAULT_SORT_BY,
  type SortOrder,
  DEFAULT_SORT_ORDER,
} from "@/utils/constants";

import AuthenticatedPage from "@/hoc/AuthenticatedPage";
import { type RouterInputs } from "@/trpc/shared";
import Products from "./products";

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
          <Products products={favoritedProducts} />
      </Container>
    );
  },
  "/favourites",
);

export default FavouritesPage;
