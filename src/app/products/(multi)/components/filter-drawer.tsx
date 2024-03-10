"use client"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer"
import * as Tabs from "@radix-ui/react-tabs"
import { FilterIcon } from "lucide-react"
import { useState } from "react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { RouterInputs } from "@/trpc/shared"
import type { Brand, Category, Model } from "@prisma/client"

type SortBy = RouterInputs["product"]["all"]["sortBy"]
type SortOrder = RouterInputs["product"]["all"]["sortOrder"]

interface SearchParams {
  search?: string;
  sortBy: SortBy;
  sortOrder: SortOrder;
  model?: string;
  category?: string;
  brand?: string;
}

function FilterDrawer({
  params,
  setFilter,
  values
}: {
  params: SearchParams,
  setFilter: (model?: string, category?: string, brand?: string) => void
  values: {models: Model[], brands: Brand[], categories: Category[]}
}) {

  const [isOpen, setIsOpen] = useState(false)
  const [model, setModel] = useState(params.model ?? undefined)
  const [brand, setBrand] = useState(params.brand ?? undefined)
  const [category, setCategory] = useState(params.brand ?? undefined)

  const {models, brands, categories} = values

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <FilterIcon />
      </DrawerTrigger>
      <DrawerContent className="p-5">
        <Tabs.Root defaultValue="model">
          <DrawerHeader>
            <Tabs.List className="flex flex-row items-center justify-around w-full">
              <ToggleGroup type="single">
                <Tabs.Trigger value="model" asChild>
                  <ToggleGroupItem value="model" size="lg" className="w-full">
                    Model
                  </ToggleGroupItem>
                </Tabs.Trigger>
                <Tabs.Trigger value="brand" asChild>
                  <ToggleGroupItem value="brand" size="lg" className="w-full">
                    Brand
                  </ToggleGroupItem>
                </Tabs.Trigger>
                <Tabs.Trigger value="category" asChild>
                  <ToggleGroupItem value="category" size="lg" className="w-full">
                    Category
                  </ToggleGroupItem>
                </Tabs.Trigger>
              </ToggleGroup>
            </Tabs.List>
          </DrawerHeader>
          <div className="overflow-scroll h-72">
            <Tabs.Content value="model">
              <RadioGroup defaultValue={model} onValueChange={(value) => setModel(value)}>
                {models.map((model, i) => (
                  <label htmlFor={model.id} key={i} className="flex items-center gap-2 border px-4 py-2">
                    <RadioGroupItem id={model.id} value={model.slug} />
                    {model.name}
                  </label>
                ))}
              </RadioGroup>
            </Tabs.Content>
            <Tabs.Content value="brand">
              <RadioGroup defaultValue={brand} onValueChange={(value) => setBrand(value)}>
                {brands.map((brand, i) => (
                    <label htmlFor={brand.id} key={i} className="flex items-center gap-2 border px-4 py-2">
                      <RadioGroupItem id={brand.id} value={brand.slug} />
                      {brand.name}
                    </label>
                  ))}
              </RadioGroup>
            </Tabs.Content>
            <Tabs.Content value="category">
              <RadioGroup defaultValue={category} onValueChange={(value) => setCategory(value)}>
                {categories.map((category, i) => (
                    <label htmlFor={category.id} key={i} className="flex items-center gap-2 border px-4 py-2">
                      <RadioGroupItem id={category.id} value={category.slug} />
                      {category.name}
                    </label>
                  ))}
              </RadioGroup>
            </Tabs.Content>
          </div>
        </Tabs.Root>
        <DrawerFooter className="w-full py-5">
          <Button size="lg" className="w-full" onClick={() => {
            setFilter(model, category, brand)
            setIsOpen(false)
          }}>
            Apply
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => {
            setFilter()
            setModel(undefined)
            setBrand(undefined)
            setCategory(undefined)
            setIsOpen(false)
          }}>
            Clear Filters
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default FilterDrawer
