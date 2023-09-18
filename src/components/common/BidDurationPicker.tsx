import { FC } from "react";
import Select from "react-select";

const plans = [
  { label: "7 Days", value: 7 },
  { label: "14 Days", value: 14 },
  { label: "30 Days", value: 30 },
];

const DownIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 8.25l-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const UpIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="h-6 w-6"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.5 15.75l7.5-7.5 7.5 7.5"
    />
  </svg>
);

interface BidDurationPickerProps {
  onChange: (date: Date | undefined) => void;
}

const BidDurationPicker: FC<BidDurationPickerProps> = ({
  onChange: handleChange,
}) => {
  return (
    <Select
      placeholder="Select a duration"
      onChange={(newValue, meta) => {
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
