import { FC } from "react";
import Select from "react-select";

const plans = [
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
];

interface BidDurationPickerProps {
  onChange: (date: Date | undefined) => void;
}

const BidDurationPicker: FC<BidDurationPickerProps> = ({
  onChange: handleChange,
}) => {
  return (
    <Select
      placeholder="Select a duration"
      onChange={(newValue) => {
        const d = (newValue?.value ?? 7) + Date.now() * 60 * 60 * 24;
        handleChange(new Date(d));
      }}
      options={plans}
      styles={{
        container: (provided) => ({
          ...provided,
          width: "100%",
          border: "none",
          outline: "none",
          font: "inherit",
        }),
      }}
    />
  );
};

export default BidDurationPicker;
