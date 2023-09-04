import { NextPage } from "next";
import { useSearchParams } from "next/navigation";

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import Product from "@/types/product";
import { api } from "@/utils/api";

export const Home: NextPage = () => {
  // get products according to the search params
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  let response;
  if (params.has("category")) {
    const categoryId = params.get("category")!;
    response = api.category.getProductsByCategoryId.useQuery({ categoryId });
  } else {
    response = api.product.getProducts.useQuery({});
  }

  const { data: products, isLoading, isError } = response;

  if (isError || products instanceof Error)
    return <div>Something went wrong</div>;
  if (isLoading) return <div className="pt-24">Loading...</div>;
  if (!products || products.length === 0)
    return <div className="pt-24">No data to Show</div>;

  return (
    <main>
      <Container>
        <div
          className="
            grid 
            grid-cols-1 
            gap-8 
            pt-24 
            sm:grid-cols-2 
            md:grid-cols-3
            lg:grid-cols-4
            xl:grid-cols-4
            2xl:grid-cols-6
          "
        >
          {products.map((product) => (
            <ListingCard
              key={product.id}
              product={product as unknown as Product}
            />
          ))}
        </div>
      </Container>
    </main>
  );
};

export default Home;
