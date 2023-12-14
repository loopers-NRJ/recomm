import { NextPage } from "next";
import { useRouter } from "next/router";

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import { api } from "@/utils/api";
import ServerError from "@/components/common/ServerError";
import { useSearchParams } from "next/navigation";
import {
  DefaultSearch,
  DefaultSortBy,
  DefaultSortOrder,
  SortBy,
  SortOrder,
} from "@/utils/constants";

const Listings: NextPage = () => {
  // user the params to get User ID
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);
  const userId = useRouter().query.userid as string;

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;
  // use the user ID to get the listings
  const listingApi = api.user.getUserListingsById.useInfiniteQuery(
    {
      userId,
      search,
      sortBy,
      sortOrder,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  if (listingApi.isLoading) {
    return <LoadingProducts />;
  }
  if (listingApi.isError) {
    return <ServerError message={listingApi.error.message} />;
  }
  const listings = listingApi.data.pages.flatMap((page) => page.listings);
  if (listings.length === 0) {
    return (
      <Container>
        <div className="flex h-[500px] items-center justify-center font-semibold">
          No Products Available
        </div>
      </Container>
    );
  }

  return (
    <main>
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6">
          {listings.map((product) => (
            <ListingCard key={product.id} product={product} hideHeartIcon />
          ))}
        </div>
      </Container>
    </main>
  );
};

export default Listings;
