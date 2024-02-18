import { type FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { type Plan, plans } from "@/utils/constants";

interface BidDurationPickerProps {
  onChange: (date?: Plan) => void;
}

const BidDurationPicker: FC<BidDurationPickerProps> = ({
  onChange: handleChange,
}) => {
  return (
    <Select
      onValueChange={(value: string) => {
        handleChange(value ? (parseInt(value) as Plan) : undefined);
      }}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select the Duration" />
      </SelectTrigger>
      <SelectContent>
        {plans.map((plan) => (
          <SelectItem key={plan} value={plan.toString()}>
            {plan} days
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BidDurationPicker;
