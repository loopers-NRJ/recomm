import { Button } from "@/components/ui/button";
import { type SortOrder } from "@/utils/constants";
import { ArrowDown, ArrowUp } from "lucide-react";

interface Props<T extends string> {
  title: T;
  sortBy: T;
  setSortBy: (sortBy: T) => void;
  sortOrder: SortOrder;
  setSortOrder: (sortOrder: SortOrder) => void;
}

export default function TableHeader<T extends string>({
  title,
  setSortBy,
  setSortOrder,
  sortBy,
  sortOrder,
}: Props<T>) {
  return (
    <Button
      className="flex items-center gap-0 capitalize"
      variant="ghost"
      size="sm"
      onClick={() => {
        if (sortBy !== title) {
          return setSortBy(title);
        }
        if (sortOrder === "asc") {
          setSortOrder("desc");
        } else {
          setSortOrder("asc");
        }
      }}
    >
      {title}
      {sortBy === title &&
        (sortOrder === "asc" ? (
          <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
          <ArrowDown className="ml-2 h-4 w-4" />
        ))}
    </Button>
  );
}
