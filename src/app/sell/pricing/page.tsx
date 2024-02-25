import { CompletedProfilePage } from "@/hoc/AuthenticatedPage";
import Pricing from "./Pricing";

const PostingProductPricingPage = CompletedProfilePage(() => {
  return <Pricing />;
});

export default PostingProductPricingPage;
