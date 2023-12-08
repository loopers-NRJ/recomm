import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { CategoryPayloadIncluded } from "@/types/prisma";
import { StarFilledIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";

interface CategoryPickerProps {
  categories: CategoryPayloadIncluded[];
  onSelect: (category: CategoryPayloadIncluded) => void;
  selectedCategorySlug?: string;
  hasNextPage?: boolean;
  fetchNextPage: () => void;
}

export default function CategoryPicker({
  categories,
  onSelect,
  selectedCategorySlug,
  hasNextPage,
  fetchNextPage,
}: CategoryPickerProps) {
  const router = useRouter();

  return (
    <Container className="flex flex-col items-center gap-3">
      <div className="relative flex h-11 w-full max-w-sm items-center justify-center">
        {selectedCategorySlug && (
          <Button
            variant="ghost"
            className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center justify-center"
            onClick={() => router.back()}
          >
            <LeftArrow />
          </Button>
        )}
        <h1 className="text-lg font-semibold">Choose the category</h1>
      </div>
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
                  {category.featuredCategory && (
                    <span title="Frequently Used Category">
                      <StarFilledIcon className="scale-75" />
                    </span>
                  )}
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
    </Container>
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
