import AuthorizedPage from "@/hoc/AuthenticatedPage";
import Pricing from "./Pricing";

const PostingProductPricingPage = AuthorizedPage(() => {
  return <Pricing />;
});

export default PostingProductPricingPage;
