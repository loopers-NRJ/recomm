import Container from "@/components/Container";
import { MobileCategoryBar } from "@/components/category-bars";
import Products from "./products";

export default async function Home() {
  return (
    <main>
      <Container className="flex flex-col">
        <MobileCategoryBar />
        <Products />
      </Container>
    </main>
  );
}
