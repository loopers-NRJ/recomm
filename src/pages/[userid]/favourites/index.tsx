"use client";

import { NextPage } from "next";
import { api } from "@/utils/api";
import Product from "@/types/product";
import ListingCard from "@/components/ListingCard";
import Container from "@/components/Container";

const Favourites: NextPage = () => {
  const { data: products, isLoading } = api.user.getMyFavorites.useQuery({});

  if (isLoading) return <div>Loading...</div>;

  if (products instanceof Error) return <div>Something went wrong</div>;
  else if (products === undefined || products.length === 0)
    return <div>No Products in the List</div>;

  return (
    <Container>
      <div
        className="
            grid
            grid-cols-1 
            gap-8 
            sm:grid-cols-2 
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-5
            2xl:grid-cols-6
          "
      >
        {products.map((product) => (
          <ListingCard
            key={product.id}
            product={product as unknown as Product}
            isFavourite={true}
          />
        ))}
      </div>
    </Container>
  );
};

export default Favourites;
