"use client";

import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import toast from "react-hot-toast";
import { usePostingState } from "@/app/sell/PostingState";
import { type Coupon } from "@prisma/client";

export function CouponCodeButton({
  onRemove: handleRemove,
  onSuccess: handleSuccess,
  selectedCategoryId,
}: {
  onRemove: () => void;
  onSuccess: (discount: Coupon) => void;
  selectedCategoryId: string;
}) {
  const { couponCode, setCouponCode, formError } = usePostingState();

  const [couponStatus, setCouponStatus] = useState<
    "closed" | "open" | "valid" | "invalid" | "loading"
  >("closed");

  useEffect(() => {
    if (couponCode) {
      validateCouponCode.mutate({
        code: couponCode,
        categoryId: selectedCategoryId,
      });
    }
  }, []);

  const validateCouponCode = api.coupon.validate.useMutation({
    onMutate: () => {
      setCouponStatus("loading");
    },
    onSuccess: (result) => {
      if (result) {
        handleSuccess(result);
        toast.success("Coupon code applied successfully");
        setCouponStatus("valid");
      } else {
        toast.error("Invalid coupon code");
        setCouponStatus("invalid");
      }
    },
    onError: (error) => {
      setCouponStatus("invalid");
      errorHandler(error);
    },
  });
  return (
    <Label
      className={cn(`flex items-center justify-end gap-2`, {
        "justify-between": couponStatus !== "closed",
      })}
      htmlFor="input-element"
    >
      {couponStatus === "closed" ? (
        <Button variant="outline" onClick={() => setCouponStatus("open")}>
          Apply Coupon Code
        </Button>
      ) : (
        "Coupon Code"
      )}

      {couponStatus !== "closed" && (
        <div className="flex items-center justify-center gap-2">
          <Input
            id="input-element"
            placeholder="Enter"
            value={couponCode ?? ""}
            onChange={(e) => setCouponCode(e.target.value)}
            className={cn({
              "border-red-500": formError.couponCode,
              "border-green-500": couponStatus === "valid",
              "border-blue-500": couponStatus === "loading",
            })}
            disabled={couponStatus === "loading" || couponStatus === "valid"}
            onBlur={() =>
              couponCode === "" &&
              couponStatus !== "valid" &&
              setCouponStatus("closed")
            }
          />
          {couponCode && couponStatus !== "valid" && (
            <Button
              variant="ghost"
              size="sm"
              title="Apply"
              onClick={() => {
                validateCouponCode.mutate({
                  code: couponCode,
                  categoryId: selectedCategoryId,
                });
              }}
              disabled={couponStatus === "loading"}
            >
              <Check />
            </Button>
          )}
          {couponStatus === "valid" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400"
              title="Remove"
              onClick={() => {
                handleRemove();
                setCouponCode(undefined);
                setCouponStatus("closed");
              }}
            >
              <X />
            </Button>
          )}
        </div>
      )}
      {formError.couponCode && (
        <span className="text-red-500">{formError.couponCode.message}</span>
      )}
    </Label>
  );
}
