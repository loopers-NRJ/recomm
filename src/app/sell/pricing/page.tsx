import { CompletedProfilePage } from "@/hoc/AuthenticatedPage";
import Pricing from "./Pricing";

const PostingProductPricingPage = CompletedProfilePage(
  Pricing,
  "/sell/pricing",
);

export default PostingProductPricingPage;
