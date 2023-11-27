"use client";

import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import { ProductsPayloadIncluded } from "@/types/prisma";
import { api } from "@/utils/api";

const Favourites: NextPage = () => {
  const session = useSession();

  const {
    data,
    isLoading,
    isError,
    // error,
    refetch,
  } = api.user.getMyFavorites.useQuery({});

  useEffect(() => {
    void refetch();
  }, [session.status, refetch]);

  if (isLoading) return <LoadingProducts />;

  // if (isError) return <div>{error.message}</div>;
  if (isError)
    return (
      <Container>
        <div className="flex h-screen w-full items-center justify-center">
          Something Went Wrong
        </div>
      </Container>
    );
  else if (data === undefined || data.favoritedProducts.length === 0)
    return (
      <Container>
        <div className="flex h-[500px] items-center justify-center font-semibold">
          No Products Available
        </div>
      </Container>
    );

  return (
    <Container>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6">
        {data.favoritedProducts.map((product) => (
          <ListingCard
            key={product.id}
            product={product as unknown as ProductsPayloadIncluded}
            isFavourite
            onFavoriteStateChange={() => void refetch()}
          />
        ))}
      </div>
    </Container>
  );
};

export default Favourites;
