import { FC } from "react";

import { Select } from "../ui/select";

interface BidDurationPickerProps {
  setEndDate: (date: Date | undefined) => void;
}

const plans = [
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
];

const BidDurationPicker: FC<BidDurationPickerProps> = ({ setEndDate }) => {
  return (
    <Select
      onValueChange={(value) => {
        setEndDate(new Date(+value));
        console.log(new Date(+value), +value);
      }}
      defaultValue={``}
    >
      {/* <SelectTrigger id="area">
        <SelectValue placeholder="Select" />
      </SelectTrigger> */}
      <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
        {plans.map((plan) => (
          <option
            key={plan.value}
            value={`${Date.now() + plan.value * 3600 * 24}`}
          >
            {plan.label}
          </option>
        ))}
      </select>
    </Select>
  );
};
export default BidDurationPicker;
