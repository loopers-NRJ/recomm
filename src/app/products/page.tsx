import Products from "@/components/products-area";
import { type SortBy, type SortOrder } from "@/utils/constants";

interface SearchParams {
  search?: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  modelId?: string;
  categoryId?: string;
  brandId?: string;
}

export default function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <>
      <Products {...searchParams} />
    </>
  );
}
