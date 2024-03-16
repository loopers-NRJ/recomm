import ProfileCompletedPage from "@/hoc/ProfileCompletedPage";
import PricingPage from "./PricingPage";

const PostingProductPricingPage = ProfileCompletedPage(
  PricingPage,
  "/sell/pricing",
);

export default PostingProductPricingPage;
