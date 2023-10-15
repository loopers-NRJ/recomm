import { NextPage } from "next";
import { useSearchParams } from "next/navigation";

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import { ProductsPayloadIncluded } from "@/types/prisma";
import { api } from "@/utils/api";
import {
  DefaultSearch,
  SortBy,
  DefaultSortBy,
  SortOrder,
  DefaultSortOrder,
} from "@/utils/constants";

export const ProductsPages: NextPage = () => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const search = params.get("search") ?? DefaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? DefaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? DefaultSortOrder;
  const categoryId = params.get("category") ?? undefined;
  const brandId = params.get("brand") ?? undefined;
  const modelId = params.get("model") ?? undefined;
  const productsApi = api.product.getProducts.useQuery({
    search,
    sortBy,
    sortOrder,
    modelId,
    categoryId,
    brandId,
  });

  if (productsApi.isError || productsApi.data instanceof Error)
    return <div>Something went wrong</div>;
  if (productsApi.isLoading) return <LoadingProducts />;
  if (!productsApi.data || productsApi.data.products.length === 0)
    return <div className="pt-24">No data to Show</div>;

  return (
    <main>
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {productsApi.data.products.map((product) => (
            <ListingCard
              key={product.id}
              product={product as unknown as ProductsPayloadIncluded}
            />
          ))}
        </div>
      </Container>
    </main>
  );
};

export default ProductsPages;
