import { Input } from "../ui/input";
import { Label } from "../ui/label";
import BidDurationPicker from "../common/BidDurationPicker";
import { type SingleModelPayloadIncluded } from "@/types/prisma";
import { type ProductFormError } from "@/utils/validation";
import { type Plan } from "@/utils/constants";
import * as React from "react";
import { CouponCodeButton } from "./CouponCodeButton";

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
        <CouponCodeButton
          couponCode={couponCode}
          setCouponCode={setCouponCode}
          formError={formError}
        />
      </div>
    </section>
  );
}
