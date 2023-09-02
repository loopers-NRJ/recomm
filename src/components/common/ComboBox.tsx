import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { FC, useEffect, useState } from "react";

interface Item {
  id: string;
  name: string;
}

interface ComboBoxProps {
  items: Item[];
  selected: string;
  onSelect: (selected: string) => void;
  label?: string;
}

const ComboBox: FC<ComboBoxProps> = ({
  items: originalItems,
  selected,
  onSelect,
  label = "item",
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(originalItems);
  useEffect(() => {
    setItems([...originalItems]);
  }, [originalItems]);
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
            ? items.find((item) => item.id === selected)?.name
            : `Select ${label}...`}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${label}...`}
            onValueChange={(e) =>
              setItems(
                originalItems.filter((item) =>
                  new RegExp(e, "i").test(item.name)
                )
              )
            }
          />
          <CommandEmpty>No {label} found.</CommandEmpty>
          <CommandGroup>
            {items.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={(currentValue) => {
                  onSelect(currentValue === selected ? "" : currentValue);
                  setOpen(false);
                }}
                value={item.id}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected === item.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
