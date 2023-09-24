import { FC } from "react";

import { Button } from "@/components/ui/button";
import { OptionPayloadIncluded } from "@/types/prisma";

import { Label } from "../ui/label";

export interface VariantSelectorProps {
  option: OptionPayloadIncluded;
  selectedVariantId?: string;
  setSelectedVariantId: (optionId: string, valueId: string) => void;
  requiredError: boolean;
}

export const VariantSelector: FC<VariantSelectorProps> = ({
  option,
  selectedVariantId,
  setSelectedVariantId,
  requiredError,
}) => {
  return (
    <div className="mt-3 flex flex-col items-start justify-between gap-2">
      <Label>{option.name}</Label>
      <div className="flex flex-wrap gap-1 sm:gap-3">
        {option.values.map((value) => (
          <Button
            role="button"
            key={value.id}
            className={`border ${
              selectedVariantId === value.id ? "bg-slate-200" : ""
            } ${requiredError ? "border-red-500" : ""}`}
            variant="ghost"
            onClick={() => {
              // setSelectedVariantId(option.id, value.id);
              // page is reloading when I click on the button why ?
              if (!selectedVariantId) {
                setSelectedVariantId(option.id, value.id);
              } else if (selectedVariantId === value.id) {
                setSelectedVariantId(option.id, undefined as unknown as string);
              } else {
                setSelectedVariantId(option.id, value.id);
              }
            }}
          >
            {value.name}
          </Button>
        ))}
      </div>
    </div>
  );
};
