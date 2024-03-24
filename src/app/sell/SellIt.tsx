"use client";

import CategoryPicker from "@/components/common/CategoryPicker";
import Loading from "@/components/common/Loading";
import ServerError from "@/components/common/ServerError";
import { useClientselectedCity } from "@/store/ClientSelectedCity";
import { api } from "@/trpc/react";
import { parseAsString, useQueryState } from "next-usequerystate";
import PostingForm from "@/app/sell/PostingForm";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

function Alert({ count }: { count: number }) {
  const router = useRouter();
  return (
    <AlertDialog defaultOpen>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remainder: {count} more to go...</AlertDialogTitle>
          <AlertDialogDescription>
            You cannot post anymore once you reach the limit
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className="ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={() => router.back()}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction className="bg-sky-500">Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function Sellit({
  count,
  isPrimeSeller,
}: {
  count: number;
  isPrimeSeller: boolean;
}) {
  const [parentCategorySlug, setParentCaregorySlug] = useQueryState(
    "category",
    parseAsString,
  );
  const city = useClientselectedCity((selected) => selected.city?.value);

  const categoryApi = api.category.all.useInfiniteQuery(
    {
      parentSlug: parentCategorySlug ?? undefined,
      parentId: parentCategorySlug ? undefined : null,
      city,
    },
    {
      getNextPageParam: (page) => page.nextCursor,
    },
  );
  const featuredCategoryApi = api.category.featured.useInfiniteQuery(
    {
      city,
    },
    {
      getNextPageParam: (page) => page.nextCursor,
    },
  );

  if (categoryApi.isError || featuredCategoryApi.isError) {
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
      <>
        {!isPrimeSeller && <Alert count={count} />}
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
      </>
    );
  }
}
