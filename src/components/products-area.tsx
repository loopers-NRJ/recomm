"use client";

import { useClientSelectedState } from "@/store/SelectedState";
import { api } from "@/trpc/react";
import { type SortBy, type SortOrder } from "@/utils/constants";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";

interface Props {
  search?: string;
  sortBy?: SortBy;
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

  const {useQuery: getCategoryId} = api.category.bySlug;
  const {useQuery: getBrandId} = api.brand.bySlug;
  const {useQuery: getModelId} = api.model.bySlug;

  let modelId = undefined
  let categoryId = undefined
  let brandId = undefined
  if (category) {
    const { data: categoryData } = getCategoryId({categorySlug: category});
    if(typeof categoryData !== 'string')
      categoryId = categoryData?.id;
  }

  if (brand) {
    const {data} = getBrandId({brandSlug: brand});
    brandId = data?.id ?? undefined;
  }

  if (model) {
    const {data} = getModelId({modelSlug: model});
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
  const { data: favData, isLoading: isFavLoading } = api.user.favorites.useQuery({});
  const favourites = favData?.favoritedProducts.map((product) => product.id) ?? [];

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <>
      {!isLoading && !isFavLoading ? data.pages.map(page => {
        if (page.products.length == 0)
          return (
            <div key="0" className="flex h-[500px] pt-10 justify-center font-semibold">
              No Products Available
            </div>
          )
        else return <div className="product-area grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 mb-32">
          {page.products.map(product => <ListingCard key={product.id} heart={favourites.includes(product.id)} product={product} />)}
        </div>
      })
        : <LoadingProducts />}
    </>
  );
};

export default Products;
