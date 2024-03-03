import Container from "@/components/Container";
import { DEVICE_TYPE_HEADER_NAME } from "@/utils/constants";
import Products from "@/components/products-area";
import { headers } from "next/headers";
import {
  MobileCategoryBar,
  DesktopCategoryBar,
} from "@/components/category-bars";

export default function Home() {
  const device = headers().get(DEVICE_TYPE_HEADER_NAME);
  return (
    <main>
      <Container className="flex flex-col">
        {device === "mobile" ? <MobileCategoryBar /> : <DesktopCategoryBar />}
        <Products />
      </Container>
    </main>
  );
}
