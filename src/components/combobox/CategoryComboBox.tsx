import React, { useState } from "react";
import { Label } from "../ui/label";
import ComboBox from "../common/ComboBox";
import { api } from "@/trpc/react";
import { type Item } from "@/types/custom";
import { useClientSelectedState } from "@/store/SelectedState";

/**
 * A wrapper for the ComboBox component with some default props for categories
 */

function CategoryComboBox({
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
  const selectedState = useClientSelectedState((selected) => selected.state);
  const categorySearch = api.search.leafCategory.useQuery({
    search,
    state: selectedState,
  });
  return (
    <Label className="flex w-full cursor-pointer items-center justify-between">
      Category
      <ComboBox
        label="Category"
        selected={selected}
        onSelect={onSelect}
        value={search}
        onChange={setSearch}
        items={categorySearch.data}
        isLoading={categorySearch.isLoading}
        isError={categorySearch.isError}
        refetch={() => void categorySearch.refetch()}
        requiredError={requiredError}
        disabled={disabled}
      />
    </Label>
  );
}

export default React.memo(CategoryComboBox);
