"use client"

import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer"
import { api } from "@/trpc/react"
import * as Tabs from "@radix-ui/react-tabs"
import { FilterIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo, useState } from "react"
import { useClientSelectedState } from "@/store/SelectedState"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function FilterDrawer() {
  const router = useRouter()
  const params = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [model, setModel] = useState<string | undefined>(params.get('model') ?? undefined)
  const [brand, setBrand] = useState<string | undefined>(params.get('brand') ?? undefined)
  const [category, setCategory] = useState<string | undefined>(params.get('category') ?? undefined)

  const state = useClientSelectedState((selected) => selected.state)

  const modelQuery = api.model.all.useQuery({ state })
  const brandQuery = api.brand.all.useQuery({ state })
  const categoryQuery = api.category.all.useQuery({ state })

  const q = new URLSearchParams(params.toString())
  const query = useMemo(() => {
    if (model) q.set('model', model)
    if (brand) q.set('brand', brand)
    if (category) q.set('category', category)
    return q.toString()
  }, [category, model, brand])

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
                {!modelQuery.isLoading && modelQuery.data &&
                  modelQuery.data.models.map((model, i) => (
                    <label htmlFor={model.id} key={i} className="flex items-center gap-2 border px-4 py-2">
                      <RadioGroupItem id={model.id} value={model.slug} />
                      {model.name}
                    </label>
                  ))}
              </RadioGroup>
            </Tabs.Content>
            <Tabs.Content value="brand">
              <RadioGroup defaultValue={brand} onValueChange={(value) => setBrand(value)}>
                {!brandQuery.isLoading && brandQuery.data &&
                  brandQuery.data.brands.map((brand, i) => (
                    <label htmlFor={brand.id} key={i} className="flex items-center gap-2 border px-4 py-2">
                      <RadioGroupItem id={brand.id} value={brand.slug} />
                      {brand.name}
                    </label>
                  ))}
              </RadioGroup>
            </Tabs.Content>
            <Tabs.Content value="category">
              <RadioGroup defaultValue={category} onValueChange={(value) => setCategory(value)}>
                {!categoryQuery.isLoading && categoryQuery.data &&
                  categoryQuery.data.categories.map((category, i) => (
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
            router.push(`/products?${query}`)
            setModel(undefined)
            setBrand(undefined)
            setCategory(undefined)
            setIsOpen(false)
          }}>
            Apply
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => {
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
