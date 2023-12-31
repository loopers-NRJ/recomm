"use client";

import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import { api } from "@/trpc/react";
import {
  defaultSearch,
  SortBy,
  defaultSortBy,
  SortOrder,
  defaultSortOrder,
} from "@/utils/constants";
import { useSearchParams } from "next/navigation";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import Loading from "@/components/common/Loading";
import { withProtectedRoute } from "@/hoc/ProtectedRoute";

export const getServerSideProps = withProtectedRoute();

const Favourites: NextPage = () => {
  const session = useSession();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const search = params.get("search") ?? defaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? defaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? defaultSortOrder;

  const favoritesApi = api.user.getMyFavorites.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  useEffect(() => {
    void favoritesApi.refetch();
  }, [favoritesApi, session.status]);

  if (favoritesApi.isLoading) {
    return <LoadingProducts />;
  }

  if (favoritesApi.isError) {
    return <ServerError message={favoritesApi.error.message} />;
  }
  const favoritedProducts = favoritesApi.data.pages.flatMap(
    (page) => page.favoritedProducts,
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
            onFavoriteStateChange={() => void favoritesApi.refetch()}
          />
        ))}
      </div>
      {!favoritesApi.isLoading && favoritesApi.isFetching && <Loading />}
      <Button
        className="mt-8 self-end"
        onClick={() => {
          void favoritesApi.fetchNextPage();
        }}
        disabled={!favoritesApi.hasNextPage}
        variant="ghost"
      >
        View More
      </Button>
    </Container>
  );
};

export default Favourites;
