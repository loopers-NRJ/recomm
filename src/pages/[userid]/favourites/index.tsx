"use client";

import { NextPage } from "next";
import { api } from "@/utils/api";
import Product from "@/types/product";
import ListingCard from "@/components/ListingCard";
import { useRouter } from "next/router";
import Container from "@/components/Container";
import { useSession } from "next-auth/react";
import { User } from "next-auth";

const Favourites: NextPage = () => {
  // user the params to get User ID
  const userId = useRouter().query.userid as string;
  const { data: session } = useSession();

  // use the user ID to get the favourites
  const { data: products, isLoading } = api.user.getMyFavoritesById.useQuery({
    userId,
  });

  if (isLoading) return <div>Loading...</div>;
  if (products instanceof Error) return <div>Something went wrong</div>;
  if (products === undefined || products.length === 0)
    return <div>No Products in the List</div>;

  return (
    <main>
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
              currentUser={session?.user as User}
              key={product.id}
              product={product as unknown as Product}
            />
          ))}
        </div>
      </Container>
    </main>
  );
};

export default Favourites;
