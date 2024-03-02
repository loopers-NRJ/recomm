import { Input } from "@/components/ui/input";
import { debounce } from "@/utils/helper";
import { Search } from "lucide-react";
import React from "react";

function AdminSearchbar({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <div className="flex w-full items-center gap-1 rounded-lg border ps-3">
      <Search className="h-4 w-4 shrink-0 opacity-50" />
      <Input
        placeholder="Search"
        role="search"
        type="search"
        defaultValue={search}
        onChange={debounce((e) => void setSearch(e.target.value), 300)}
        className="border-none focus:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
}

export default React.memo(AdminSearchbar);
