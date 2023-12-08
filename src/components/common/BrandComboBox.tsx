import { useState } from "react";
import { Label } from "../ui/label";
import ComboBox from "./ComboBox";
import { api } from "@/utils/api";
import { Item } from "@/types/custom";

export default function BrandComboBox({
  onSelect,
  selected,
  categoryId,
  requiredError,
  disabled,
}: {
  selected?: Item;
  onSelect: (selected?: Item) => void;
  categoryId?: string;
  requiredError?: boolean;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const brandsSearch = api.search.brands.useQuery({ categoryId, search });
  return (
    <Label className="flex items-center justify-between">
      Brands
      <ComboBox
        label="Brands"
        selected={selected}
        onSelect={onSelect}
        value={search}
        onChange={setSearch}
        items={brandsSearch.data}
        isLoading={brandsSearch.isLoading}
        isError={brandsSearch.isError}
        refetch={() => void brandsSearch.refetch()}
        requiredError={requiredError}
        disabled={disabled}
      />
    </Label>
  );
}
