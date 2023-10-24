import { useState } from "react";
import { Label } from "../ui/label";
import ComboBox from "./ComboBox";
import { api } from "@/utils/api";
import { Item } from "@/types/custom";

export default function CategoryComboBox({
  onSelect,
  selected,
  requiredError,
  disabled,
}: {
  selected?: Item;
  onSelect: (selected?: Item) => void;
  requiredError?: boolean;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const categorySearch = api.search.category.useQuery({ search });
  return (
    <div className="flex items-center justify-between">
      <Label>Category</Label>
      <ComboBox
        label="Category"
        selected={selected}
        onSelect={onSelect}
        value={search}
        onChange={setSearch}
        items={categorySearch.data?.categories}
        isLoading={categorySearch.isLoading}
        isError={categorySearch.isError}
        refetch={() => void categorySearch.refetch()}
        requiredError={requiredError}
        disabled={disabled}
      />
    </div>
  );
}
