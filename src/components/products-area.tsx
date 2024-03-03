"use client";

import { useClientSelectedState } from "@/store/SelectedState";
import { api } from "@/trpc/react";
import { type SortOrder } from "@/utils/constants";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import { type RouterInputs } from "@/trpc/shared";

interface Props {
  search?: string;
  sortBy?: RouterInputs["product"]["all"]["sortBy"];
  sortOrder?: SortOrder;
  model?: string;
  category?: string;
  brand?: string;
}

const Products: React.FC<Props> = ({
  search,
  sortBy,
  sortOrder,
  model,
  category,
  brand,
}) => {
  const selectedState = useClientSelectedState((selected) => selected.state);

  const { useQuery: getCategoryId } = api.category.bySlug
  const { useQuery: getBrandId } = api.brand.bySlug;
  const { useQuery: getModelId } = api.model.bySlug;

  let modelId = undefined;
  let categoryId = undefined;
  let brandId = undefined;

  if (category) {
    const { data: categoryData } = getCategoryId({ categorySlug: category });
    if (typeof categoryData !== "string") categoryId = categoryData?.id;
  }

  if (brand) {
    const { data } = getBrandId({ brandSlug: brand });
    brandId = data?.id ?? undefined;
  }

  if (model) {
    const { data } = getModelId({ modelSlug: model });
    modelId = data?.id ?? undefined;
  }

  const { data, isLoading, isError } = api.product.all.useInfiniteQuery(
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
      getNextPageParam: (lastItem) => lastItem.nextCursor,
    },
  );

  const { data: favData, isLoading: isFavLoading, isError: favError } = api.user.favorites.useQuery(
    {
      search,
      sortOrder,
      modelId,
      categoryId,
      brandId,
    },
    {
      getNextPageParam: (lastItem) => lastItem.nextCursor,
    },
  );

  const favourites = favData?.favoritedProducts.map((product) => product.id) ?? [];

  const products = data?.pages.map((page) => page.products).flat() ?? [];

  if (isError){
    return <div>Something went wrong</div>;
  } 

  if (isLoading) {
    return <LoadingProducts />; 
  }

  if (!isLoading && products.length == 0){
    return (
      <div className="flex h-[500px] justify-center pt-10 font-semibold" >
        No Products Available
      </div>
    );
  } 
  return (
      <div className="product-area mb-32 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
        {products.map((product) => (
          <ListingCard 
            key={product.id} 
            heart={favourites.includes(product.id)} 
            product={product} />)) 
        }
      </div>
  );
};

export default Products;
