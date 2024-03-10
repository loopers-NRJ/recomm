import { api } from "@/trpc/server";
import Sellit from "./SellIt";
import AuthorizedPage from "@/hoc/AuthenticatedPage";

const SellitPage = AuthorizedPage(async () => {
  const count = await api.user.productSellingCount.query();

  if (typeof count === "string") return <h1>{count}</h1>;

  if (count < 1) {
    return <h1>You have No listings left</h1>;
  }

  return <Sellit count={count} />
}, "/sell");


export default SellitPage;
