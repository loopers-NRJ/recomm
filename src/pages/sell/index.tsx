import PostingForm from "@/components/posting/PostingForm";
import CategoryPicker from "@/components/common/CategoryPicker";
import Loading from "@/components/common/Loading";
import useUrl from "@/hooks/useUrl";
import { api } from "@/utils/api";
import { withProtectedRoute } from "@/hoc/ProtectedRoute";
import ServerError from "@/components/common/ServerError";

export const getServerSideProps = withProtectedRoute();

export default function SellitPage() {
  const [parentCategorySlug, setParentCaregorySlug] =
    useUrl<string>("category");
  const categoryApi = api.category.getCategoriesWithoutPayload.useInfiniteQuery(
    {
      parentSlug: parentCategorySlug,
      parentId: parentCategorySlug ? undefined : null,
    },
    {
      getNextPageParam: (page) => page.nextCursor,
    }
  );
  const featuredCategoryApi =
    api.category.getFeaturedCategories.useInfiniteQuery(
      {},
      {
        getNextPageParam: (page) => page.nextCursor,
      }
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
    (page) => page.categories
  );
  if (categories.length === 0 && parentCategorySlug) {
    return <PostingForm selectedCategorySlug={parentCategorySlug} />;
  } else {
    return (
      <CategoryPicker
        categories={categories}
        featuredCategories={featuredCategories}
        selectedCategorySlug={parentCategorySlug}
        onSelect={(category) => setParentCaregorySlug(category.slug)}
        hasNextPage={categoryApi.hasNextPage}
        fetchNextPage={() => void categoryApi.fetchNextPage()}
      />
    );
  }
}
