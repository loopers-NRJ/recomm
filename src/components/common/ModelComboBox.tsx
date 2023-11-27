import { useState } from "react";
import { Label } from "../ui/label";
import ComboBox from "./ComboBox";
import { api } from "@/utils/api";
import { Item } from "@/types/custom";

export default function ModelComboBox({
  onSelect,
  selected,
  categoryId,
  brandId,
  requiredError,
  disabled,
}: {
  selected?: Item;
  onSelect: (selected?: Item) => void;
  categoryId?: string;
  brandId?: string;
  requiredError?: boolean;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const modelsSearch = api.search.models.useQuery({
    categoryId,
    brandId,
    search,
  });
  return (
    <div className="flex items-center justify-between">
      <Label>Category</Label>
      <ComboBox
        label="Models"
        selected={selected}
        onSelect={onSelect}
        value={search}
        onChange={setSearch}
        items={modelsSearch.data}
        isLoading={modelsSearch.isLoading}
        isError={modelsSearch.isError}
        refetch={() => void modelsSearch.refetch()}
        requiredError={requiredError}
        disabled={disabled}
      />
    </div>
  );
}
