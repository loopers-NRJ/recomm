import AdminPage from "@/hoc/AdminPage";
import { api } from "@/trpc/server";
import { notFound } from "next/navigation";
import EditCoupon from "./EditCoupon";
import { AccessType } from "@prisma/client";

const EditCouponPage = AdminPage<{ couponId: string }>(async (props) => {
  const couponId = props.params.couponId;
  const coupon = await api.coupon.byId.query({ id: couponId });

  if (!coupon || typeof coupon === "string") {
    return notFound();
  }
  return <EditCoupon coupon={coupon} />;
}, AccessType.updateCoupon);

export default EditCouponPage;
