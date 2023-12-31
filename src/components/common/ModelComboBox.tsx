import React, { useState } from "react";
import { Label } from "../ui/label";
import ComboBox from "./ComboBox";
import { api } from "@/trpc/react";
import { type Item } from "@/types/custom";
import ErrorMessage from "./ErrorMessage";
import { useClientSelectedState } from "@/store/SelectedState";

function ModelComboBox({
  onSelect,
  selected,
  categoryId,
  brandId,
  error,
  disabled,
}: {
  selected?: Item;
  onSelect: (selected?: Item) => void;
  categoryId?: string;
  brandId?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");

  const selectedState = useClientSelectedState((selected) => selected.state);

  const modelsSearch = api.search.models.useQuery({
    categoryId,
    brandId,
    search,
    state: selectedState,
  });
  return (
    <div>
      <Label className="flex items-center justify-between">
        Model
        <ComboBox
          label="Models"
          selected={selected}
          onSelect={onSelect}
          value={search}
          onChange={setSearch}
          items={modelsSearch.data}
          isLoading={modelsSearch.isLoading || !modelsSearch.data}
          isError={modelsSearch.isError}
          refetch={() => void modelsSearch.refetch()}
          requiredError={!!error}
          disabled={disabled}
        />
      </Label>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

export default React.memo(ModelComboBox);
