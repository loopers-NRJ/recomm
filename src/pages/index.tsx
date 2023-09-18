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

  const { data, isLoading, isError } = api.product.getProducts.useQuery({
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
    return (
      <Container>
        <div className="flex h-[500px] items-center justify-center pt-24 font-semibold">
          Something went wrong
        </div>
      </Container>
    );
  }
  if (data instanceof Error) {
    return (
      <Container>
        <div className="flex h-[500px] items-center justify-center pt-24 font-semibold">
          Something went wrong
        </div>
      </Container>
    );
  }
  if (data === undefined || data.products.length === 0) {
    return (
      <Container>
        <div className="flex h-[500px] items-center justify-center pt-24 font-semibold">
          No Products Available
        </div>
      </Container>
    );
  }

  return (
    <main>
      <Container>
        <div className="grid grid-cols-1 gap-8 pt-24 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data.products.map((product) => (
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
