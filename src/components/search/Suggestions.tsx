import {
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { api } from "@/utils/api";
import { debounce } from "@/utils/helper";
import { useRouter } from "next/router";
import { FC, useEffect } from "react";

interface SuggestionProps {
  searchKey: string;
  setOpen: (open: boolean) => void;
}

const Suggestions: FC<SuggestionProps> = ({ searchKey, setOpen }) => {
  const router = useRouter();

  const {
    data: suggestions,
    isLoading,
    refetch,
  } = api.search.all.useQuery({ search: searchKey });

  useEffect(() => {
    if (searchKey && searchKey.length > 2) {
      debounce(() => void refetch())();
    }
  }, [refetch, searchKey]);

  if (isLoading)
    return (
      <CommandGroup>
        <span
          className={`suggestions absolute left-0 top-10 rounded-md border bg-white md:w-[100px] lg:w-[300px]`}
        >
          Loading...
        </span>
      </CommandGroup>
    );
  if (suggestions instanceof Error)
    return (
      <CommandGroup>
        <span
          className={`suggestions absolute left-0 top-10 rounded-md border bg-white md:w-[100px] lg:w-[300px]`}
        >
          {suggestions.message}
        </span>
      </CommandGroup>
    );

  if (suggestions === undefined) {
    return (
      <CommandGroup>
        <span
          className={`suggestions absolute left-0 top-10 rounded-md border bg-white md:w-[100px] lg:w-[300px]`}
        >
          No Suggestions
        </span>
      </CommandGroup>
    );
  }

  const { categories, brands, models } = suggestions;

  return (
    <CommandList>
      <CommandGroup heading="Category">
        {categories.map((category) => (
          <CommandItem
            key={category.id}
            onSelect={() => {
              void router.push(`/products/?category=${category.id}`);
              setOpen(false);
            }}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-200/50"
          >
            {category.name}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Brand">
        {brands.map((brand) => (
          <CommandItem
            key={brand.id}
            onSelect={() => {
              void router.push(`/products/?brand=${brand.id}`);
            }}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-200/50"
          >
            {brand.name}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Model">
        {models.map((modal) => (
          <CommandItem
            key={modal.id}
            onSelect={() => {
              void router.push(`/products/?model=${modal.id}`);
            }}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-200/50"
          >
            {modal.name}
          </CommandItem>
        ))}
      </CommandGroup>
    </CommandList>
  );
};
export default Suggestions;
