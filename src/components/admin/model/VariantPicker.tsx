import { FC } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Variant } from "@/types/admin";

interface VariantPickerProps {
  variants: Variant[];
  setVariants: (
    newVarientsOrSetter: Variant[] | ((oldVarients: Variant[]) => Variant[])
  ) => void;
}

const VariantPicker: FC<VariantPickerProps> = ({ variants, setVariants }) => {
  return (
    <div className="rounded-lg border px-1">
      {variants.map((variant) => (
        <div
          className="VARIANT-CONTAINER my-2 flex flex-row flex-wrap gap-1"
          key={variant.id}
        >
          <Input
            value={variant.option}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && variant.option.length === 0) {
                setVariants(variants.filter((v) => v.id !== variant.id));
              }
            }}
            onChange={(e) =>
              setVariants(
                variants.map((v) =>
                  v.id === variant.id ? { ...v, option: e.target.value } : v
                )
              )
            }
            placeholder="Attribute"
            className="VARIANT-OPTION-INPUT sm:w-fit"
          />
          <div className="VARIANT-VALUES-CONTAINER min-h-10 flex w-fit flex-grow flex-wrap items-center gap-1 rounded-md border border-input bg-background p-1">
            {variant.values.map((item, index) => (
              <Button
                key={item}
                onClick={() => {
                  const newValues = [...variant.values];
                  newValues.splice(index, 1);
                  setVariants(
                    variants.map((v) =>
                      v.id === variant.id ? { ...v, values: newValues } : v
                    )
                  );
                }}
                variant="ghost"
                className="VARIANT-VALUES h-8 w-fit border px-2"
                size="default"
              >
                {item}
              </Button>
            ))}
            <input
              type="text"
              className="VARIANT-VALUE-INPUT w-0 flex-grow outline-none"
              value={variant.search}
              placeholder="Values"
              onKeyDown={(e) => {
                if (e.key === "Backspace" && variant.search.length === 0) {
                  const newValues = [...variant.values];
                  setVariants(
                    variants.map((v) =>
                      v.id === variant.id
                        ? {
                            ...v,
                            values: newValues,
                            search: (newValues.pop() ?? "") + " ",
                          }
                        : v
                    )
                  );
                }
              }}
              onChange={(e) => {
                const text = e.target.value;
                if (
                  (text.endsWith(" ") || text.endsWith(",")) &&
                  text.trim().length > 0
                ) {
                  setVariants(
                    variants.map((v) =>
                      v.id === variant.id
                        ? {
                            ...v,
                            values: [...v.values, variant.search.trim()],
                            search: "",
                          }
                        : v
                    )
                  );
                } else {
                  setVariants(
                    variants.map((v) =>
                      v.id === variant.id ? { ...v, search: text } : v
                    )
                  );
                }
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default VariantPicker;
