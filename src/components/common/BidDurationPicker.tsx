import { FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
        setEndDate(value as unknown as Date);
        console.log(value);
      }}
      defaultValue={`${Date.now() + 7 * 3600 * 24}`}
    >
      <SelectTrigger id="area">
        <SelectValue placeholder="Select" />
      </SelectTrigger>
      <SelectContent>
        {plans.map((plan) => (
          <SelectItem key={plan.value} value={`${plan.value * 3600 * 24}`}>
            {plan.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
export default BidDurationPicker;
