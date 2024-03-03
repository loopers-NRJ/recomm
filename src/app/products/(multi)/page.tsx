import Products from "@/components/products-area";
import { type RouterInputs } from "@/trpc/shared";
import { type SortOrder } from "@/utils/constants";
import { FilterIcon, SortDesc } from "lucide-react";

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
      <div className="flex justify-end gap-2 my-4">
        <SortDesc />
        <FilterIcon />
      </div>
      <Products {...searchParams} />
    </>
  );
}
