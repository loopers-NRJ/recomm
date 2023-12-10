import { Input } from "../ui/input";
import { Label } from "../ui/label";
import BidDurationPicker from "../common/BidDurationPicker";
import { SingleModelPayloadIncluded } from "@/types/prisma";

interface PricingInfoSectionProps {
  price: string;
  setPrice: (value: string) => void;
  onBidDurationChange: (value: Date | undefined) => void;
  model: SingleModelPayloadIncluded;
}

export default function PricingInfoSection({
  price,
  setPrice,
  onBidDurationChange,
  model,
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
            placeholder="Enter here"
            value={price}
            onChange={(e) => {
              const num = Number(e.target.value);
              if (!isNaN(num) && num >= 0 && Number.isInteger(num)) {
                setPrice(e.target.value);
              }
            }}
          />
        </Label>
        <Label
          className="flex items-center justify-between gap-2"
          title="The bid will be closed after the duration"
        >
          Select the Bidding duration
          <BidDurationPicker onChange={onBidDurationChange} />
        </Label>
      </div>
    </section>
  );
}
