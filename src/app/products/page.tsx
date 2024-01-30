"use client";
import { useSearchParams } from "next/navigation";

import Container from "@/components/Container";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import { api } from "@/trpc/react";
import {
  defaultSearch,
  type SortBy,
  defaultSortBy,
  type SortOrder,
  defaultSortOrder,
} from "@/utils/constants";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import Loading from "@/components/common/Loading";
import { useClientSelectedState } from "@/store/SelectedState";

export default function ProductsPages() {
  const params = useSearchParams();

  const search = params.get("search") ?? defaultSearch;
  const sortBy = (params.get("sortBy") as SortBy) ?? defaultSortBy;
  const sortOrder = (params.get("sortOrder") as SortOrder) ?? defaultSortOrder;
  const categoryId = params.get("category") ?? undefined;
  const brandId = params.get("brand") ?? undefined;
  const modelId = params.get("model") ?? undefined;

  const selectedState = useClientSelectedState((selected) => selected.state);
  const productsApi = api.product.all.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      modelId,
      categoryId,
      brandId,
      state: selectedState,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  if (productsApi.isError) {
    return <ServerError message={productsApi.error.message} />;
  }
  if (productsApi.isLoading) {
    return <LoadingProducts />;
  }
  const products = productsApi.data.pages.flatMap((page) => page.products);

  if (!productsApi.data || products.length === 0) {
    return <div className="pt-24">No data to Show</div>;
  }

  return (
    <main>
      <Container className="flex flex-col">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {products.map((product) => (
            <ListingCard key={product.id} product={product} />
          ))}
        </div>

        {!productsApi.isLoading && productsApi.isFetching && <Loading />}
        <Button
          className="mt-8 self-end"
          onClick={() => {
            void productsApi.fetchNextPage();
          }}
          disabled={!productsApi.hasNextPage}
          variant="ghost"
        >
          View More
        </Button>
      </Container>
    </main>
  );
}
