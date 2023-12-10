import { Check, ChevronsUpDown } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Item } from "@/types/custom";
import { debounce } from "@/utils/helper";
import Loading from "./Loading";

interface ComboBoxProps {
  label?: string;

  selected?: Item;
  onSelect: (selected?: Item) => void;

  items?: Item[];
  refetch?: () => void;
  isLoading?: boolean;
  isError?: boolean;

  value: string;
  onChange: (search: string) => void;
  requiredError?: boolean;
  disabled?: boolean;
}

const ComboBox: FC<ComboBoxProps> = ({
  selected,
  onSelect,
  label = "item",
  value: search,
  onChange: setSearch,
  requiredError,
  disabled,

  items,
  isLoading,
  isError,
  refetch,
}) => {
  const [open, setOpen] = useState(false);

  const previousItemsRef = useRef<Item[]>([]);
  useEffect(() => {
    if (items instanceof Array) {
      previousItemsRef.current = items;
    }
  }, [items]);
  const isItems = items instanceof Array;

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-[200px] justify-between text-sm font-normal text-black
            ${requiredError && !selected ? "border-red-500" : ""}
          `}
          disabled={disabled}
        >
          {selected
            ? (isItems ? items : previousItemsRef.current).find(
                (item) => item.id === selected.id
              )?.name
            : `Select ${label}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${label}...`}
            value={search}
            onValueChange={(value) => {
              setSearch(value);
              debounce(() => refetch?.())();
            }}
          />
          <CommandList className="max-h-40">
            {(isItems ? items : previousItemsRef.current).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={(currentValue) => {
                  onSelect(
                    currentValue === selected?.name
                      ? undefined
                      : (isItems ? items : previousItemsRef.current).find(
                          (item) =>
                            item.name.toLowerCase() ===
                            currentValue.toLowerCase()
                        )
                  );
                  setOpen(false);
                }}
                value={item.name}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected?.name === item.name ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.name}
              </CommandItem>
            ))}
            {!isLoading && (items ?? previousItemsRef.current).length === 0 && (
              <div className="p-6 text-center text-sm">No {label} found.</div>
            )}
            {isLoading && (
              <div className="flex items-center justify-center p-6 text-sm">
                <Loading size={28} />
              </div>
            )}
            {isError && (
              <div className="p-6 text-center text-sm">
                Something went wrong.
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
