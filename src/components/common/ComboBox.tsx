import { Check, ChevronsUpDown } from "lucide-react";
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
import { debounce } from "@/utils/helper";

interface Item {
  id: string;
  name: string;
}

interface ComboBoxProps {
  items?: Item[];
  selected?: Item;
  onSelect: (selected?: Item) => void;
  label?: string;
  refetch?: (partialName: string) => void;
  loading?: boolean;
}

const ComboBox: FC<ComboBoxProps> = ({
  items: originalItems,
  selected,
  onSelect,
  label = "item",
  refetch,
  loading,
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(originalItems);
  const previousItemsRef = useRef<Item[]>([]);

  useEffect(() => {
    setItems(originalItems);
  }, [originalItems]);

  useEffect(() => {
    if (items) {
      previousItemsRef.current = items;
    }
  }, [items]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between text-black"
        >
          {selected
            ? (items ?? previousItemsRef.current).find(
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
            // value={search}
            onValueChange={(e) => {
              debounce(() => refetch?.(e))();
            }}
          />
          <CommandEmpty>No {label} found.</CommandEmpty>
          <CommandGroup>
            {(items ?? previousItemsRef.current).map((item) => (
              <CommandItem
                key={item.id}
                onSelect={(currentValue) => {
                  onSelect(
                    currentValue === selected?.name
                      ? undefined
                      : (items ?? previousItemsRef.current).find(
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
            {loading && <h1 className="text-center">...</h1>}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
