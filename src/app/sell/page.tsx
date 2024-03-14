import { api } from "@/trpc/server";
import Sellit from "./SellIt";
import ProfileCompletedPage from "@/hoc/ProfileCompletedPage";

const SellitPage = ProfileCompletedPage(async () => {
  const data = await api.user.productSellingCount.query();

  if (typeof data === "string") return <h1>{data}</h1>;
  const { isPrimeSeller, count } = data;

  if (!isPrimeSeller && count < 1) {
    return <h1>You have No listings left</h1>;
  }

  return <Sellit {...data} />
}, "/sell");


export default SellitPage;
