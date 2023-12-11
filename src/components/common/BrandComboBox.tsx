import React, { useState } from "react";
import { Label } from "../ui/label";
import ComboBox from "./ComboBox";
import { api } from "@/utils/api";
import { Item } from "@/types/custom";
import ErrorMessage from "./ErrorMessage";

function BrandComboBox({
  onSelect,
  selected,
  categoryId,
  error,
  disabled,
}: {
  selected?: Item;
  onSelect: (selected?: Item) => void;
  categoryId?: string;
  error?: string;
  disabled?: boolean;
}) {
  const [search, setSearch] = useState("");
  const brandsSearch = api.search.brands.useQuery({ categoryId, search });

  return (
    <div>
      <Label className="flex items-center justify-between">
        Brand
        <ComboBox
          label="Brands"
          selected={selected}
          onSelect={onSelect}
          value={search}
          onChange={setSearch}
          items={brandsSearch.data}
          isLoading={brandsSearch.isLoading || !brandsSearch.data}
          isError={brandsSearch.isError}
          refetch={() => void brandsSearch.refetch()}
          requiredError={!!error}
          disabled={disabled}
        />
      </Label>
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

export default React.memo(BrandComboBox);
