import { NextPage } from "next";
import { useSearchParams } from "next/navigation";

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import { Product } from "@/types/prisma";
import { api } from "@/utils/api";
import {
  DefaultPage,
  DefaultSearch,
  DefaultSortBy,
  DefaultSortOrder,
  SortBy,
  SortOrder,
} from "@/utils/validation";

export const Home: NextPage = () => {
  // get products according to the search params
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const page = +(params.get("page") ?? DefaultPage);
  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;
  const modelId = params.get("model") ?? undefined;
  const categoryId = params.get("category") ?? undefined;

  const {
    data: products,
    isLoading,
    isError,
  } = api.product.getProducts.useQuery({
    page,
    search,
    sortBy,
    sortOrder,
    modelId,
    categoryId,
  });

  if (isLoading) {
    return <LoadingProducts />;
  }
  if (isError) {
    return <div>Something went wrong</div>;
  }
  if (products instanceof Error) {
    return <div>{products.message}</div>;
  }
  if (products === undefined || products.length === 0) {
    return <div className="pt-24">No products to Show</div>;
  }

  return (
    <main>
      <Container>
        <div className="grid grid-cols-1 gap-8 pt-24 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6">
          {products.map((product) => (
            <ListingCard
              key={product.id}
              product={product as unknown as Product}
              hideHeartIcon
            />
          ))}
        </div>
      </Container>
    </main>
  );
};

export default Home;
