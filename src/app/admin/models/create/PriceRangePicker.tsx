import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function PriceRangePicker({
  priceRange: [min, max],
  setPriceRange,
  requiredError,
}: {
  priceRange: [string, string];
  setPriceRange: (range: [string, string]) => void;
  requiredError?: boolean;
}) {
  useEffect(() => {
    if (!isNaN(+min) && +min > +max) {
      setPriceRange([min, min]);
    }
  }, [min]);

  return (
    <div className="flex">
      <Input
        className={cn("w-28 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-r-none border-r-0 text-center", {
          "border-red-500": requiredError,
        })}
        type="number"
        value={min}
        onChange={(e) => setPriceRange([e.target.value, max])}
        placeholder="Min"
      />
      <Input
        className={cn("w-28 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none border-l-0 text-center", {
          "border-red-500": +min > +max || requiredError,
        })}
        type="number"
        value={max}
        onChange={(e) => setPriceRange([min, e.target.value])}
        placeholder="Max"
      />
    </div>
  );
}
