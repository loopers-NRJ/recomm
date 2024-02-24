"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { type ProductFormError } from "@/utils/validation";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import * as React from "react";
import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import toast from "react-hot-toast";

export function CouponCodeButton({
  couponCode,
  setCouponCode,
  formError,
}: {
  couponCode?: string;
  setCouponCode: (value?: string) => void;
  formError: ProductFormError;
}) {
  const [couponStatus, setCouponStatus] = useState<
    "closed" | "open" | "valid" | "invalid" | "loading"
  >("closed");

  const validateCouponCode = api.coupon.validate.useMutation({
    onMutate: () => {
      setCouponStatus("loading");
    },
    onSuccess: (result) => {
      if (result) {
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
                validateCouponCode.mutate({ code: couponCode });
              }}
              disabled={couponStatus === "loading"}
            >
              <Check />
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
