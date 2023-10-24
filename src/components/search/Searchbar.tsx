import { CommandList } from "cmdk";
import { useRouter } from "next/router";
import { useState } from "react";
import { Command, CommandInput } from "@/components/ui/command";
import Suggestions from "./Suggestions";

const Search = () => {
  const [searchKey, setSearchKey] = useState<string | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const router = useRouter();

  return (
    <Command className="relative overflow-visible rounded-md border">
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
        placeholder="Search"
      />
      <CommandList className="absolute left-0 top-11 w-full border bg-white">
        {searchKey && <Suggestions setOpen={setOpen} searchKey={searchKey} />}
      </CommandList>
    </Command>
  );
};
export default Search;
