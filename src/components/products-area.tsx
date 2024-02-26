"use client";
import { useClientSelectedState } from "@/store/SelectedState";
import { api } from "@/trpc/react";
import { type SortBy, type SortOrder } from "@/utils/constants";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import { useSession } from "next-auth/react";

interface Props {
  search?: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  modelId?: string;
  categoryId?: string;
  brandId?: string;
}

const Products: React.FC<Props> = ({
  search,
  sortBy,
  sortOrder,
  modelId,
  categoryId,
  brandId,
}) => {
  const { data: session } = useSession();
  const selectedState = useClientSelectedState((selected) => selected.state);
  const { data, isSuccess, isLoading, isError } = api.product.all.useInfiniteQuery(
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
  const { data: favData } = api.user.favorites.useQuery({});
  const favourites = favData?.favoritedProducts.map((product) => product.id) || [];

  if (isLoading) {
    return <LoadingProducts />;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return (
    <>
      <div className="product-area grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 mb-32">
        {isSuccess && data.pages.map(page => page.products.map(product => {
          if (session && session.user) {
            if( favourites.includes(product.id) ) {
              return <ListingCard key={product.id} heart={"fav"} product={product} />
            }else {
              return <ListingCard key={product.id} heart={"not-fav"} product={product} />
            }
          }
          return <ListingCard key={product.id} heart={"not-show"} product={product} />
        }))}
      </div>
    </>
  );
};

export default Products;
