import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FetchItems, Item } from "@/types/item";
import { debounce } from "@/utils/helper";

interface ComboBoxProps {
  selected?: Item;
  onSelect: (selected?: Item) => void;
  label?: string;
  fetchInput?: unknown;
  fetchItems: FetchItems;
  value: string;
  onChange: (search: string) => void;
  requiredError?: boolean;
  disabled?: boolean;
}

const ComboBox: FC<ComboBoxProps> = ({
  selected,
  onSelect,
  label = "item",
  fetchInput = {},
  fetchItems,
  value: search,
  onChange: setSearch,
  requiredError,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const {
    data: items,
    isError,
    isLoading: loading,
    refetch,
  } = fetchItems(fetchInput);
  const previousItemsRef = useRef<Item[]>([]);
  useEffect(() => {
    if (items instanceof Array) {
      previousItemsRef.current = items;
    }
  }, [items]);
  const isItems = items instanceof Array;

  return (
    <Popover open={open} onOpenChange={setOpen}>
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
          <CommandEmpty>No {label} found.</CommandEmpty>
          <CommandGroup>
            {((isItems ? items : previousItemsRef.current).length === 0 &&
              !loading) ||
              (isError && (
                <div className="flex justify-center">No {label} found.</div>
              ))}
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
            {loading && (
              <div className="flex justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </div>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
