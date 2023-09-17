import { FC } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { AdminVariantInput as Variant } from "@/types/admin";

interface AdminVariantPickerProps {
  variantOptions: Variant[];
  setVariants: (
    newVarientsOrSetter: Variant[] | ((oldVarients: Variant[]) => Variant[])
  ) => void;
}

const AdminVariantPicker: FC<AdminVariantPickerProps> = ({
  variantOptions: options,
  setVariants,
}) => {
  return (
    <div className="rounded-lg border px-1">
      {options.map((option) => (
        <div
          className="VARIANT-CONTAINER my-2 flex flex-row flex-wrap gap-1"
          key={option.id}
        >
          <Input
            value={option.name}
            onKeyDown={(e) => {
              if (
                e.key === "Backspace" &&
                option.name.length === 0 &&
                option.variantValues.length === 0
              ) {
                setVariants(options.filter((v) => v.id !== option.id));
              }
            }}
            onChange={(e) =>
              setVariants(
                options.map((v) =>
                  v.id === option.id ? { ...v, name: e.target.value } : v
                )
              )
            }
            placeholder="Option"
            className="VARIANT-OPTION-INPUT sm:w-fit"
          />
          <div className="VARIANT-VALUES-CONTAINER min-h-10 flex w-fit flex-grow flex-wrap items-center gap-1 rounded-md border border-input bg-background p-1">
            {option.variantValues.map((item, index) => (
              <Button
                key={item}
                onClick={() => {
                  const newValues = [...option.variantValues];
                  newValues.splice(index, 1);
                  setVariants(
                    options.map((v) =>
                      v.id === option.id
                        ? { ...v, variantValues: newValues }
                        : v
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
              value={option.search}
              placeholder="Values"
              onKeyDown={(e) => {
                if (e.key === "Backspace" && option.search.length === 0) {
                  const newValues = [...option.variantValues];
                  setVariants(
                    options.map((v) =>
                      v.id === option.id
                        ? {
                            ...v,
                            variantValues: newValues,
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
                    options.map((v) =>
                      v.id === option.id
                        ? {
                            ...v,
                            variantValues: [
                              ...v.variantValues,
                              option.search.trim(),
                            ],
                            search: "",
                          }
                        : v
                    )
                  );
                } else {
                  setVariants(
                    options.map((v) =>
                      v.id === option.id ? { ...v, search: text } : v
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

export default AdminVariantPicker;
