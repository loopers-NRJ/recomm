import Container from "@/components/Container";
import { FC } from "react";
import { useRouter } from "next/router";

const ProductPage: FC = () => {
  const router = useRouter();
  const productId = router.query.productId! as string;

  return (
    <Container>
      <div className="pt-4 text-black">{productId}</div>
    </Container>
  );
};
export default ProductPage;
