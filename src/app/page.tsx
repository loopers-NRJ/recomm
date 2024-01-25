import Container from "@/components/Container";
import {
  defaultSortBy,
  defaultSortOrder,
  deviceTypeHeaderName,
} from "@/utils/constants";
import Products from "@/components/products-area";
import { headers } from "next/headers";
import { MobileCategoryBar, DesktopCategoryBar } from "@/components/category-bars";

export default function Home() {
  const device = headers().get(deviceTypeHeaderName)
  return (
    <main>
      <Container className="flex flex-col">
        {device === 'mobile' ? <MobileCategoryBar /> : <DesktopCategoryBar />}
        <Products sortBy={defaultSortBy} sortOrder={defaultSortOrder} />
      </Container>
    </main>
  );
}

