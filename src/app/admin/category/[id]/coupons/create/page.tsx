import AdminPage from "@/hoc/AdminPage";
import { AccessType } from "@prisma/client";
import CreateCoupon from "./CreateCoupon";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

const CreateCouponPage = AdminPage<{ id: string }>(async ({ params }) => {
  const category = await api.category.byId.query({
    categoryId: params.id,
  });
  if (!category || typeof category === "string") {
    return notFound();
  }

  return <CreateCoupon category={category} />;
}, AccessType.createCoupon);
export default CreateCouponPage;
