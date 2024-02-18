"use client";

import { Input } from "../ui/input";
import { Label } from "../ui/label";
import BidDurationPicker from "../common/BidDurationPicker";
import { type SingleModelPayloadIncluded } from "@/types/prisma";
import { type ProductFormError } from "@/utils/validation";
import { type Plan } from "@/utils/constants";
import { Button } from "../ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import * as React from "react";
import { api } from "@/trpc/react";
import { errorHandler } from "@/utils/errorHandler";
import toast from "react-hot-toast";

interface PricingInfoSectionProps {
  price: string;
  setPrice: (value: string) => void;
  couponCode?: string;
  setCouponCode: (value?: string) => void;
  onBidDurationChange: (value?: Plan) => void;
  model: SingleModelPayloadIncluded;
  formError: ProductFormError;
}

export default function PricingInfoSection({
  price,
  setPrice,
  couponCode,
  setCouponCode,
  onBidDurationChange,
  model,
  formError,
}: PricingInfoSectionProps) {
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
    <section className="mb-16">
      <h2 className="my-4 text-xl font-bold">Price Information</h2>
      {/* Show the price suggestion */}
      <div className="flex flex-col gap-6">
        <Label className="flex flex-col gap-2">
          <span>Set the Selling price for your {model.name}</span>
          <Input
            type="number"
            placeholder="Enter"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={formError.price ? "border-red-500" : ""}
          />
          {formError.price && (
            <span className="text-red-500">{formError.price.message}</span>
          )}
        </Label>
        <Label
          className="flex items-center justify-between gap-2"
          title="The bid will be closed after the duration"
        >
          Select the Bidding duration
          <BidDurationPicker onChange={onBidDurationChange} />
        </Label>
        <Label
          className={cn(`flex items-center justify-end gap-2`, {
            "justify-between": couponStatus !== "closed",
          })}
          htmlFor="couponCode"
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
                id="couponCode"
                placeholder="Enter"
                value={couponCode ?? ""}
                onChange={(e) => setCouponCode(e.target.value)}
                className={cn({
                  "border-red-500": formError.couponCode,
                  "border-green-500": couponStatus === "valid",
                  "border-blue-500": couponStatus === "loading",
                })}
                disabled={
                  couponStatus === "loading" || couponStatus === "valid"
                }
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
      </div>
    </section>
  );
}
