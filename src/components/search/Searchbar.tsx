import { useState } from "react";
import { Command, CommandInput } from "@/components/ui/command";
import * as Dialog from "@radix-ui/react-dialog";
import Suggestions from "./Suggestions";
import { useRouter } from "next/router";
import { CommandList } from "cmdk";

const Search = () => {
  const [searchKey, setSearchKey] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const SearchIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm font-normal text-muted-foreground hover:bg-accent hover:text-foreground md:w-40 lg:w-60">
          <span className="hidden md:block">Search...</span>
          {SearchIcon}
        </div>
      </Dialog.Trigger>
      <Dialog.Portal className="relative h-full w-full">
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm backdrop-filter transition-opacity" />
        <Dialog.Content className="absolute right-1/2 top-1/3 z-50 min-w-[300px] translate-x-1/2 rounded-md border bg-white text-center">
          <Command>
            <CommandInput
              onValueChange={(key) => {
                setSearchKey(key);
              }}
              value={searchKey}
              onKeyDown={(e) => {
                if (e.nativeEvent.key === "Enter") {
                  void router.push(`/?search=${searchKey}`);
                  setOpen(false);
                  setSearchKey(undefined);
                }
              }}
              placeholder="Search Products"
            />
            <CommandList>
              {searchKey && (
                <Suggestions setOpen={setOpen} searchKey={searchKey} />
              )}
            </CommandList>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
export default Search;
