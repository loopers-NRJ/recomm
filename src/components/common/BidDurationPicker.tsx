import { type FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const plans = [
  { label: "7 Days", value: "7" },
  { label: "14 Days", value: "14" },
  { label: "30 Days", value: "30" },
] as const;

interface BidDurationPickerProps {
  onChange: (date: Date | undefined) => void;
}

const BidDurationPicker: FC<BidDurationPickerProps> = ({
  onChange: handleChange,
}) => {
  return (
    <Select
      onValueChange={(value: (typeof plans)[number]["value"]) => {
        const selected = value ?? plans[0].value;
        const date = new Date();
        date.setDate(date.getDate() + Number(selected));
        handleChange(date);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select the Duration" />
      </SelectTrigger>
      <SelectContent>
        {plans.map((plan) => (
          <SelectItem key={plan.value} value={plan.value}>
            {plan.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BidDurationPicker;
