import AdminPage from "@/hoc/AdminPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import EditCoupon from "./EditCoupon";
import { AccessType } from "@prisma/client";

const EditCouponPage = AdminPage<{ couponCode: string; id: string }>(
  async (props) => {
    const { couponCode, id: categoryId } = props.params;
    const coupon = await api.coupon.byId.query({
      code: couponCode,
      categoryId,
    });

    if (!coupon || typeof coupon === "string") {
      return notFound();
    }
    return <EditCoupon coupon={coupon} />;
  },
  AccessType.updateCoupon,
);

export default EditCouponPage;
