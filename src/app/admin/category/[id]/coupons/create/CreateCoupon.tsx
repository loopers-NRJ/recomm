"use client";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import { isAlphaNumeric } from "@/utils/functions";
import { CouponType, type Category } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CreateCoupon({ category }: { category: Category }) {
  const createCouponApi = api.coupon.create.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      router.push(`/admin/tables/category/${category.id}/coupons`);
    },
    onError: errorHandler,
  });
  const [code, setCode] = useState("");
  const [type, setCouponType] = useState<CouponType>(CouponType.percentage);
  const [discount, setDiscount] = useState("");

  const router = useRouter();

  return (
    <Container className="flex justify-center">
      <section className="flex h-full w-full flex-col p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <Label className="mb-4 flex flex-col justify-center gap-2">
          Coupon Name
          <Input
            value={code}
            onChange={(e) => {
              if (e.target.value === "") return setCode("");
              if (!isAlphaNumeric(e.target.value)) {
                return toast.error(
                  "Coupon code can only contain alphabets and numbers",
                );
              }
              setCode(e.target.value);
            }}
          />
        </Label>
        <Label htmlFor="discount">
          Discount &nbsp;
          <span className="text-xs text-gray-500">
            in {type === CouponType.percentage ? "%" : "RS"}
          </span>
        </Label>
        <div className="mb-4 flex items-center justify-center">
          <Input
            id="discount"
            className="my-2 rounded-r-none border-r-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            type="number"
            value={discount}
            onChange={(e) => {
              if (e.target.value === "") return setDiscount("");
              if (
                type === CouponType.percentage &&
                Number(e.target.value) > 100
              ) {
                return toast.error(
                  "Discount percentage cannot be more than 100",
                );
              }
              if (
                type === CouponType.percentage &&
                Number(e.target.value) < 0
              ) {
                return toast.error("Discount percentage cannot be less than 0");
              }
              if (type === CouponType.fixed && Number(e.target.value) < 0) {
                return toast.error("Discount amount cannot be less than 0");
              }

              setDiscount(e.target.value);
            }}
          />
          <Select
            onValueChange={(value) => {
              setCouponType(value as CouponType);
            }}
            value={type}
          >
            <SelectTrigger
              className="w-fit rounded-l-none font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
              noIcon
            >
              <SelectValue className="focus-visible:ring-0 focus-visible:ring-offset-0" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem className="font-bold" value={CouponType.fixed}>
                RS
              </SelectItem>
              <SelectItem className="font-bold" value={CouponType.percentage}>
                %
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end justify-end gap-8">
          <Button
            onClick={() =>
              createCouponApi.mutate({
                code,
                categoryId: category.id,
                type,
                discount: Number(discount),
              })
            }
            disabled={code.trim() === "" || createCouponApi.isLoading}
          >
            Create Coupon
          </Button>
        </div>
        {createCouponApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Creating Coupon {code} ...
            <Loader2 className="animate-spin" />
          </div>
        )}
      </section>
    </Container>
  );
}
