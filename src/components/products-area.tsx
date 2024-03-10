"use client";

import { useClientSelectedState } from "@/store/SelectedState";
import { api } from "@/trpc/react";
import { type SortOrder } from "@/utils/constants";
import ListingCard from "@/components/ListingCard";
import LoadingProducts from "@/components/loading/LoadingProducts";
import { type RouterInputs } from "@/trpc/shared";
import { motion } from "framer-motion";

interface Props {
  search?: string;
  sortBy?: RouterInputs["product"]["all"]["sortBy"];
  sortOrder?: SortOrder;
  model?: string;
  category?: string;
  brand?: string;
  price?: string
}

const Products: React.FC<Props> = ({
  search,
  sortBy,
  sortOrder,
  model,
  category,
  brand,
  price,
}) => {
  const selectedState = useClientSelectedState((selected) => selected.state);

  const { data: categoryData } = api.category.bySlug.useQuery({
    categorySlug: category ?? "dummy",
  });
  const categoryId =
    typeof categoryData !== "string" ? categoryData?.id : undefined;

  const { data: brandData } = api.brand.bySlug.useQuery({
    brandSlug: brand ?? "dummy",
  });
  const brandId = brandData?.id ?? undefined;

  const { data: modelData } = api.model.bySlug.useQuery({
    modelSlug: model ?? "dummy",
  });
  const modelId = modelData?.id ?? undefined;

  const range = price ? price.split("_") : undefined
  const min = range ? parseInt(range[0] ?? "10"): 10
  const max = range ? parseInt(range[1] ?? "10000"): 10000

  const { data, isLoading, isError } = api.product.all.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      price: range ? { min, max } : undefined,
      modelId,
      categoryId,
      brandId,
      state: selectedState,
    },
    {
      getNextPageParam: (lastItem) => lastItem.nextCursor,
    },
  );

  const products = data?.pages.map((page) => page.products).flat() ?? [];

  if (isError) {
    return <div>Something went wrong...</div>;
  }

  if (isLoading) {
    return <LoadingProducts />;
  }

  if (!isLoading && products.length == 0) {
    return (
      <div className="flex h-[500px] justify-center pt-10 font-semibold">
        No Products Available
      </div>
    );
  }

  return (
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { duration: 0.5, staggerChildren: 0.03 },
          },
        }}
        initial="hidden"
        animate="show"
        className="product-area mb-32 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6"
      >
        {products.map((product) => (
          <ListingCard
            key={product.id}
            product={product}
          />
        ))}
      </motion.div>
  );
};

export default Products;
