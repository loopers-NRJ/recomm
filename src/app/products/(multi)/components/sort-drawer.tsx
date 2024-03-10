"use client"
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { RouterInputs } from '@/trpc/shared'
import { DEFAULT_SORT_BY, DEFAULT_SORT_ORDER } from '@/utils/constants'
import { SortDesc } from 'lucide-react'
import { useState } from 'react'

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

function SortDrawer({
  params,
  onSortChange,
}: {
  params: SearchParams,
  onSortChange: (sortBy: SortBy, sortOrder: SortOrder) => void
}) {

  const [isOpen, setIsOpen] = useState(false)
  const [sortBy, setSortBy] = useState<SortBy>(params.sortBy ?? DEFAULT_SORT_BY)
  const [sortOrder, setSortOrder] = useState<SortOrder>(params.sortOrder ?? DEFAULT_SORT_ORDER)

  let s = undefined
  if(sortBy === "createdAt" && sortOrder === "desc") s = "newest"
  if(sortBy === "createdAt" && sortOrder === "asc") s = "oldest"
  if(sortBy === "price" && sortOrder === "asc") s = "low-price"
  if(sortBy === "price" && sortOrder === "desc") s = "high-price"

  const [selected, setSelected] = useState(s)

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <SortDesc />
      </DrawerTrigger>
      <DrawerContent className="p-5">
        <DrawerHeader>
            <RadioGroup defaultValue={selected} onValueChange={(value) => {
                if(value === 'newest'){
                  setSortOrder('desc')
                  setSortBy('createdAt')
                } else if(value === 'oldest'){
                  setSortOrder('asc')
                  setSortBy('createdAt')
                } else if(value === 'low-price'){
                  setSortOrder('asc')
                  setSortBy('price')
                } else if(value === 'high-price'){
                  setSortOrder('desc')
                  setSortBy('price')
                }
                setSelected(value)
            }}>
              <label htmlFor="newest" className="flex items-center gap-2 border px-4 py-2">
                <RadioGroupItem id="newest" value='newest'/>
                Newest to Oldest
              </label>
              <label htmlFor="oldest" className="flex items-center gap-2 border px-4 py-2">
                <RadioGroupItem id="oldest" value='oldest' />
                Oldest to Newest
              </label>
            <label htmlFor="low-price" className="flex items-center gap-2 border px-4 py-2">
              <RadioGroupItem id="low-price" value="low-price" />
              Lowest Price to Highest
            </label>
            <label htmlFor="high-price" className="flex items-center gap-2 border px-4 py-2">
              <RadioGroupItem id="high-price" value="high-price" />
              Highest Price to Lowest
            </label>
          </RadioGroup>
        </DrawerHeader>
        <DrawerFooter className="w-full py-5">
          <Button size="lg" className="w-full" onClick={() => {
            onSortChange(sortBy, sortOrder)
            setIsOpen(false)
          }}>
            Apply
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => {
            onSortChange(undefined, undefined)
            setSelected(undefined)
            setIsOpen(false)
          }}>
            Clear
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default SortDrawer
