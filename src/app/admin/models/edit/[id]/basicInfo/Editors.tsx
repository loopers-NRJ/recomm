"use client";

import BrandComboBox from "@/components/common/BrandComboBox";
import CategoryComboBox from "@/components/common/CategoryComboBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { type Item } from "@/types/custom";
import { State } from "@prisma/client";
import { Check } from "lucide-react";
import { useState } from "react";
import type { Model } from "../types";
import { states } from "@/types/prisma";

export function ModelBrandEdit({ model }: { model: Model }) {
  const [selectedBrand, setSelectedBrand] = useState<Item>(model.brand);
  const updateModel = api.model.updateModelById.useMutation();

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <BrandComboBox
        selected={selectedBrand}
        onSelect={(brand) => brand && setSelectedBrand(brand)}
      />
      {selectedBrand?.id !== model.brandId && (
        <Button
          variant="ghost"
          size="sm"
          title="Update"
          disabled={updateModel.isLoading}
          onClick={() => {
            updateModel
              .mutateAsync({ id: model.id, brandId: selectedBrand.id })
              .then((updatedModel) => {
                model.brand = updatedModel.brand;
                model.brandId = updatedModel.brandId;
              })
              .catch(console.error);
          }}
        >
          <Check />
        </Button>
      )}
    </div>
  );
}

export function ModelCategoryEdit({ model }: { model: Model }) {
  const [selectedCategory, setSelectedCategory] = useState<Item>(
    model.category,
  );
  const updateModel = api.model.updateModelById.useMutation();
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <CategoryComboBox
        selected={selectedCategory}
        onSelect={(category) => category && setSelectedCategory(category)}
      />
      {selectedCategory?.id !== model.categoryId && (
        <Button
          variant="ghost"
          size="sm"
          title="Update"
          disabled={updateModel.isLoading}
          onClick={() => {
            updateModel
              .mutateAsync({ id: model.id, categoryId: selectedCategory.id })
              .then((updatedModel) => {
                model.category = updatedModel.category;
                model.categoryId = updatedModel.categoryId;
              })
              .catch(console.error);
          }}
        >
          <Check />
        </Button>
      )}
    </div>
  );
}

export function ModelNameEdit({ model }: { model: Model }) {
  const [value, setValue] = useState(model.name);
  const [modelNameEditEnabled, setModelNameEditEnabled] = useState(false);

  const updateModel = api.model.updateModelById.useMutation();
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <Label className="flex w-full items-center justify-between gap-2">
        Name
        {modelNameEditEnabled ? (
          <Input
            className="w-fit"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => {
              if (value === model.name) {
                setModelNameEditEnabled(false);
              }
            }}
          />
        ) : (
          <Button
            variant="ghost"
            onClick={() => setModelNameEditEnabled(true)}
            className="min-w-[200px]"
          >
            {value}
          </Button>
        )}
      </Label>
      {model.name !== value && value.trim() !== "" && (
        <Button
          variant="ghost"
          size="sm"
          title="Update"
          disabled={updateModel.isLoading}
          onClick={() => {
            updateModel
              .mutateAsync({ id: model.id, name: value })
              .then((result) => {
                model.name = result.name;
              })
              .catch(console.error);
          }}
        >
          <Check />
        </Button>
      )}
    </div>
  );
}

export function ModelCreatedStateEdit({ model }: { model: Model }) {
  const [createdState, setCreatedState] = useState<State>(State.Tamil_Nadu);
  const updateModel = api.model.updateModelById.useMutation();

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <Label className="flex w-full items-center justify-between gap-2">
        Created State
        <Select
          onValueChange={(value) => {
            setCreatedState(value as State);
          }}
          value={createdState}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="h-80">
            {states.map((state) => (
              <SelectItem value={state} key={state}>
                {state.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Label>
      {createdState !== model.createdState && (
        <Button
          variant="ghost"
          size="sm"
          title="Update"
          disabled={updateModel.isLoading}
          onClick={() => {
            updateModel
              .mutateAsync({ id: model.id, createdState })
              .then((updatedModel) => {
                model.createdState = updatedModel.createdState;
              })
              .catch(console.error);
          }}
        >
          <Check />
        </Button>
      )}
    </div>
  );
}
