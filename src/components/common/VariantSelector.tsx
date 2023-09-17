import { FC } from "react";

import { Button } from "@/components/ui/button";
import { VariantOption } from "@/types/prisma";

export interface VariantSelectorProps {
  option: VariantOption;
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
    <div className="mt-2 flex items-center">
      <span className="mr-3 shrink-0 overflow-auto text-lg font-medium">
        {option.name}
      </span>
      <div className="flex flex-wrap gap-1 sm:gap-3">
        {option.variantValues.map((value) => (
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
