"use client";

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import { api } from "@/trpc/react";
import ServerError from "@/components/common/ServerError";
import {
  defaultSearch,
  defaultSortBy,
  defaultSortOrder,
  type SortBy,
  type SortOrder,
} from "@/utils/constants";
import { redirect, useParams } from "next/navigation";

export default function Listings() {
  // user the params to get User ID
  const params = useParams();

  const userId = params.userId as string;

  if (!userId) {
    redirect("/login");
  }

  const search = (params.search as string) ?? defaultSearch;
  const sortBy = (params.sortBy as SortBy) ?? defaultSortBy;
  const sortOrder = (params.sortOrder as SortOrder) ?? defaultSortOrder;
  // use the user ID to get the listings
  const listingApi = api.user.listingsById.useInfiniteQuery(
    {
      userId,
      search,
      sortBy,
      sortOrder,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
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
            <ListingCard
              key={product.id}
              product={{ ...product, isFav: false }}
              isUser
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
