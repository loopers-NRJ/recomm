import { FC } from "react";

interface BidDurationPickerProps {
  onChange: (date: Date | undefined) => void;
}

const plans = [
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
];

const BidDurationPicker: FC<BidDurationPickerProps> = ({
  onChange: handleChange,
}) => {
  return (
    <select
      defaultValue={plans[0]?.value}
      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      onChange={(e) =>
        handleChange(new Date(+e.target.value + Date.now() * 60 * 60 * 24))
      }
    >
      {/* TODO: Design this dropdown menu */}
      {plans.map((plan) => (
        <option
          key={plan.value}
          value={`${plan.value}`}
          className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
        >
          {plan.label}
        </option>
      ))}
    </select>
  );
};

export default BidDurationPicker;
