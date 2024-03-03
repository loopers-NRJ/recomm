import Products from "@/components/products-area";
import { type RouterInputs } from "@/trpc/shared";
import { type SortOrder } from "@/utils/constants";

interface SearchParams {
  search?: string;
  sortBy: RouterInputs["product"]["all"]["sortBy"];
  sortOrder: SortOrder;
  model?: string;
  category?: string;
  brand?: string;
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
