import Container from "@/components/Container";
import {
  defaultSearch,
  type SortBy,
  defaultSortBy,
  type SortOrder,
  defaultSortOrder,
} from "@/utils/constants";
import Categories from "@/components/navbar/Categories";
import Products from "./products";
import { Suspense } from "react";
import LoadingCategories from "@/components/navbar/LoadingCategories";

interface SearchParams {
  search: string | undefined;
  sortBy: SortBy;
  sortOrder: SortOrder;
  model: string | undefined;
  category: string | undefined;
  brand: string | undefined;
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  const search = searchParams.search ?? defaultSearch;
  const sortBy = searchParams.sortBy ?? defaultSortBy;
  const sortOrder = (searchParams.sortOrder as SortOrder) ?? defaultSortOrder;
  const modelId = searchParams.model ?? undefined;
  const categoryId = searchParams.category ?? undefined;
  const brandId = searchParams.brand ?? undefined;

  return (
    <main>
      <Container className="flex flex-col">
        <Suspense fallback={<LoadingCategories />}>
          <Categories />
        </Suspense>
        <Products  {...{ search, sortBy, sortOrder, modelId, categoryId, brandId }} />
      </Container>
    </main>
  );
}

