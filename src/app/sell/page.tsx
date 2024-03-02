import Sellit from "./SellIt";
import AuthorizedPage from "@/hoc/AuthenticatedPage";

const SellitPage = AuthorizedPage(Sellit, "/sell");

export default SellitPage;
