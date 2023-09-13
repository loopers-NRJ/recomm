import { NextPage } from "next";
import { useSearchParams } from "next/navigation";
import LoadingProducts from "@/components/loading/LoadingProducts";

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import Product from "@/types/product";
import { api } from "@/utils/api";
import {
  DefaultPage,
  DefaultSearch,
  DefaultSortBy,
  DefaultSortOrder,
  SortBy,
  SortOrder,
} from "@/utils/validation";

export const ProductsPages: NextPage = () => {
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

  if (isError || products instanceof Error)
    return <div>Something went wrong</div>;
  if (isLoading) return <LoadingProducts />;
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
            />
          ))}
        </div>
      </Container>
    </main>
  );
};

export default ProductsPages;
