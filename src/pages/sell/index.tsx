import Container from "@/components/Container";
import CategoryPicker from "@/components/common/CategoryPicker";
import useUrl from "@/hooks/useUrl";
import { api } from "@/utils/api";

export default function SellitPage() {
  const [parentCategorySlug, setParentCaregorySlug] = useUrl("category");
  const categoryApi = api.category.getCategories.useInfiniteQuery(
    {
      parentSlug: parentCategorySlug,
      parentId: parentCategorySlug ? undefined : null,
    },
    {
      getNextPageParam: (page) => page.nextCursor,
    }
  );

  if (categoryApi.isError) {
    console.log(categoryApi.error);
    return <div>Something went wrong</div>;
  }
  if (categoryApi.isLoading || !categoryApi.data) {
    return <div>Loading</div>;
  }

  const categories = categoryApi.data.pages.flatMap((page) => page.categories);

  if (categories.length === 0 && parentCategorySlug) {
    return <OtherQuestions selectedCategorySlug={parentCategorySlug} />;
  } else {
    return (
      <CategoryPicker
        categories={categories}
        selectedCategorySlug={parentCategorySlug}
        onSelect={(category) => setParentCaregorySlug(category.slug)}
        hasNextPage={categoryApi.hasNextPage}
        fetchNextPage={() => void categoryApi.fetchNextPage()}
      />
    );
  }
}

function OtherQuestions({
  selectedCategorySlug,
}: {
  selectedCategorySlug: string;
}) {
  return <Container>other questions - {selectedCategorySlug}</Container>;
}
