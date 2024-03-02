"use client";

import CategoryPicker from "@/components/common/CategoryPicker";
import Loading from "@/components/common/Loading";
import ServerError from "@/components/common/ServerError";
import { useClientSelectedState } from "@/store/SelectedState";
import { api } from "@/trpc/react";
import { parseAsString, useQueryState } from "next-usequerystate";
import PostingForm from "@/app/sell/PostingForm";

export default function Sellit() {
  const [parentCategorySlug, setParentCaregorySlug] = useQueryState(
    "category",
    parseAsString,
  );
  const selectedState = useClientSelectedState((selected) => selected.state);

  const categoryApi = api.category.allWithoutPayload.useInfiniteQuery(
    {
      parentSlug: parentCategorySlug ?? undefined,
      parentId: parentCategorySlug ? undefined : null,
      state: selectedState,
    },
    {
      getNextPageParam: (page) => page.nextCursor,
    },
  );
  const featuredCategoryApi = api.category.featured.useInfiniteQuery(
    {
      state: selectedState,
    },
    {
      getNextPageParam: (page) => page.nextCursor,
    },
  );

  if (categoryApi.isError || featuredCategoryApi.isError) {
    console.log(categoryApi.error ?? featuredCategoryApi.error);
    return (
      <ServerError
        message={
          categoryApi.error?.message ?? featuredCategoryApi.error?.message ?? ""
        }
      />
    );
  }
  if (
    categoryApi.isLoading ||
    featuredCategoryApi.isLoading ||
    !categoryApi.data ||
    !featuredCategoryApi.data
  ) {
    return <Loading className="min-h-[12rem]" />;
  }

  const categories = categoryApi.data.pages.flatMap((page) => page.categories);
  const featuredCategories = featuredCategoryApi.data.pages.flatMap(
    (page) => page.categories,
  );
  if (categories.length === 0 && parentCategorySlug) {
    return <PostingForm selectedCategorySlug={parentCategorySlug} />;
  } else {
    return (
      <CategoryPicker
        categories={categories}
        featuredCategories={featuredCategories}
        selectedCategorySlug={parentCategorySlug ?? undefined}
        onSelect={(category) =>
          void setParentCaregorySlug(category.slug, { history: "push" })
        }
        hasNextPage={categoryApi.hasNextPage}
        fetchNextPage={() => void categoryApi.fetchNextPage()}
      />
    );
  }
}
