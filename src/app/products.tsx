"use client"
import { useState, type FC, useEffect, useRef } from 'react'
import { useClientSelectedState } from "@/store/SelectedState";
import { api } from '@/trpc/react';
import { type SortBy, type SortOrder, } from "@/utils/constants";
import ListingCard from '@/components/ListingCard';
import Loading from '@/components/common/Loading';
import LoadingProducts from '@/components/loading/LoadingProducts';
import { useSession } from 'next-auth/react';

interface Props {
  search: string | undefined;
  sortBy: SortBy
  sortOrder: SortOrder
  modelId: string | undefined;
  categoryId: string | undefined;
  brandId: string | undefined;
}

const Products: FC<Props> = ({ search, sortBy, sortOrder, modelId, categoryId, brandId, }) => {
  
  const session = useSession();

  const selectedState = useClientSelectedState((selected) => selected.state);
  const allProductsQuery = api.product.all.useInfiniteQuery(
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
  const { isLoading: favLoading, data } = api.user.favorites.useQuery({});

  const linkRef = useRef(null);
  const [inView, setInView] = useState(false);
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 1.0,
  }

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) setInView(true);
    })

    if (linkRef.current) observer.observe(linkRef.current);

    return () => {
      if (linkRef.current) observer.unobserve(linkRef.current);
    }
  }, [linkRef.current, options]);


  if (allProductsQuery.isLoading || favLoading) return <LoadingProducts />;
  if (allProductsQuery.error) return <div>Error</div>;

  const products = allProductsQuery.data.pages.flatMap((page) => page.products);
  if(inView && allProductsQuery.hasNextPage && !allProductsQuery.isFetching) allProductsQuery.fetchNextPage();

  const favourites = data?.favoritedProducts ?? []
  const productsWithFavourites = products.map(product => {
    const isFav = favourites.some((fav) => fav.id === product.id);
    return { ...product, isFav }
  });

  return <>
    <div className="product-area grid gap-8 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
      {
        products.length === 0 ?
          <div className="flex h-[500px] items-center justify-center font-semibold">
            No Products Available
          </div> :
          productsWithFavourites.map(product => <ListingCard key={product.id} isUser={session.status === "authenticated"} product={product} />)
      }
      <a ref={linkRef}></a>
    </div>
    {allProductsQuery.isFetchingNextPage && <Loading />}
  </>
}

export default Products
