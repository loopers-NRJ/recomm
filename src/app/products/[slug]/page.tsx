import { NextPage } from "next";

const ProductPage: NextPage<{ params: { slug: string } }> = async ({ params }) => {
  return <div>Product Page</div>;
};
export default ProductPage;
