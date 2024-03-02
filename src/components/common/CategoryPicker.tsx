import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { useQueryState, parseAsStringEnum } from "next-usequerystate";
import { type FeaturedCategoryPayloadIncluded } from "@/types/prisma";
import { type Category } from "@prisma/client";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CategoryPickerProps {
  categories: Category[];
  featuredCategories: FeaturedCategoryPayloadIncluded[];
  onSelect: (category: Category) => void;
  selectedCategorySlug?: string;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
}

export default function CategoryPicker({
  categories,
  featuredCategories,
  onSelect,
  selectedCategorySlug: selectedCategory,
  hasNextPage,
  fetchNextPage,
}: CategoryPickerProps) {
  const router = useRouter();
  const [viewMoreClicked, setViewMoreClicked] = useQueryState<"true">(
    "view_more",
    parseAsStringEnum(["true"]),
  );

  return (
    <Container className="flex flex-col items-center gap-3">
      <div className="relative flex h-11 w-full max-w-xl items-center justify-center">
        {(!!selectedCategory || viewMoreClicked === "true") && (
          <Button
            variant="ghost"
            className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center justify-center"
            onClick={() =>
              viewMoreClicked === "true" && !selectedCategory
                ? void setViewMoreClicked(null)
                : router.back()
            }
          >
            <LeftArrow />
          </Button>
        )}
        <h1 className="text-lg font-semibold">Choose the category</h1>
      </div>

      {selectedCategory === undefined && !viewMoreClicked ? (
        <FeaturedCategoryList
          featuredCategories={featuredCategories}
          onSelect={onSelect}
          onViewMore={() => void setViewMoreClicked("true")}
        />
      ) : (
        <CategoryList
          categories={categories}
          onSelect={onSelect}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}
    </Container>
  );
}

type FeaturedCategoryListProps = Pick<
  CategoryPickerProps,
  "featuredCategories" | "onSelect"
> & {
  onViewMore: () => void;
};

function FeaturedCategoryList({
  featuredCategories,
  onSelect,
  onViewMore,
}: FeaturedCategoryListProps) {
  return (
    <div className="grid w-full max-w-sm grid-cols-2 justify-items-center gap-3 p-3 pb-20">
      {featuredCategories.map((fc) => (
        <Button
          variant="ghost"
          className="flex aspect-square h-full w-full flex-col items-center justify-center gap-2 border shadow-lg"
          onClick={() => onSelect(fc.category)}
          key={fc.categoryId}
        >
          <Image
            src={fc.image.url}
            alt="Picture of the category"
            width={100}
            height={100}
          />

          <span className="capitalize">{fc.category.name}</span>
        </Button>
      ))}
      <Button
        variant="ghost"
        className="flex aspect-square h-full w-full flex-col items-center justify-center gap-2 border shadow-lg"
        onClick={onViewMore}
      >
        <div className="flex h-[100px] w-[100px] items-center justify-center">
          <DotsHorizontalIcon className="scale-[2.5]" />
        </div>
        View More
      </Button>
    </div>
  );
}

function CategoryList({
  categories,
  onSelect,
  hasNextPage,
  fetchNextPage,
}: Omit<CategoryPickerProps, "selectedCategorySlug" | "featuredCategories">) {
  return (
    <div className="w-full max-w-sm">
      <ul>
        {categories.map((category) => (
          <li key={category.id} className="h-11 w-full">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => onSelect(category)}
            >
              <span className="flex items-center justify-center">
                {category.name}
              </span>
              <RightArrow />
            </Button>
          </li>
        ))}
      </ul>
      {hasNextPage && (
        <Button variant="outline" onClick={fetchNextPage}>
          View more
        </Button>
      )}
    </div>
  );
}

const RightArrow = () => {
  return (
    <svg
      className="feather feather-chevron-right"
      fill="none"
      height="24"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
};

const LeftArrow = () => {
  return (
    <svg
      className="feather feather-chevron-left"
      fill="none"
      height="24"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
};
