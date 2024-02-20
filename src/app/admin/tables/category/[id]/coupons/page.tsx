import AdminPage from "@/hoc/AdminPage";
import CouponTable from "./CouponTable";
import { AccessType } from "@prisma/client";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";

const CouponTablePage = AdminPage<{ id: string }>(
  async ({ params }) => {
    const category = await api.category.byId.query({
      categoryId: params.id,
    });
    if (!category || typeof category === "string") {
      return notFound();
    }
    return <CouponTable category={category} />;
  },
  (accesses) =>
    accesses.some(
      (access) =>
        access === AccessType.createCoupon ||
        access === AccessType.updateCoupon ||
        access === AccessType.deleteCoupon,
    ),
);

export default CouponTablePage;
