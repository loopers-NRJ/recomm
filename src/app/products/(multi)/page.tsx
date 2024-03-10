import { type RouterInputs } from "@/trpc/shared";
import { type SortOrder } from "@/utils/constants";
import MobileProductsPage from "./components/mobile-products-page";

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
      <MobileProductsPage searchParams={searchParams} />
    </>
  );
}

