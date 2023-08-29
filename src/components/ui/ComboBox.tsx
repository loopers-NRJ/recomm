"use client";

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
import { FC, useState } from "react";
// import { api } from "@/utils/api";

interface ComboBoxProps {
  placeholder: string;
  searchQuery: string;
  onSearch: (value: string | ((prev: string) => string)) => void;
  selected?: { id: string; name: string };
  onSelect: (selected: unknown) => void;
  notFoundText?: string;
  useItems: (input: { search: string }) => {
    isLoading: boolean;
    isError: boolean;
    data: Error | { id: string; name: string }[] | undefined;
  };
}

const ComboBox: FC<ComboBoxProps> = ({
  placeholder = "",
  searchQuery,
  onSearch,
  selected,
  onSelect,
  notFoundText = "Not found.",
  useItems,
}) => {
  const [open, setOpen] = useState(false);
  const { data: items = [] } = useItems({ search: searchQuery });
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {selected ? selected.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={placeholder}
            value={searchQuery}
            onValueChange={(value) => onSearch(value)}
          />
          <CommandEmpty>{notFoundText}</CommandEmpty>
          <CommandGroup>
            {/* Error fetching the cateegories `may be network issue` */}
            {items instanceof Error ? (
              <div>{items.message}</div>
            ) : items === undefined || items.length === 0 ? (
              <div>loading</div>
            ) : (
              items.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={(currentValue) => {
                    onSelect(currentValue === selected?.id ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected?.id === item.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.name}
                </CommandItem>
              ))
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboBox;
