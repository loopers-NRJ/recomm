import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type SingleModelPayloadIncluded } from "@/types/prisma";
import * as React from "react";
import { usePostingState } from "@/app/sell/PostingState";

interface PricingInfoSectionProps {
  model: SingleModelPayloadIncluded;
}

export default function PricingInfoSection({ model }: PricingInfoSectionProps) {
  const {
    price,
    setPrice,
    formError,
    // setBidDuration
  } = usePostingState();

  return (
    <section className="flex w-full max-w-2xl flex-col">
      <h1 className="my-4 text-center text-2xl font-bold">Pricing Section</h1>
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
        {/* <Label
          className="flex items-center justify-between gap-2"
          title="The bid will be closed after the duration"
        >
          Select the Bidding duration
          <BidDurationPicker onChange={setBidDuration} />
        </Label> */}
      </div>
    </section>
  );
}
