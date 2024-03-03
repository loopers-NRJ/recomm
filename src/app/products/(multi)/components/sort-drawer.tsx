"use client"
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from '@/components/ui/drawer'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { SortDesc } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

function SortDrawer() {

  const router = useRouter()
  const params = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string | undefined>(params.get('sortBy') ?? 'name')
  const [sortOrder, setSortOrder] = useState<string | undefined>(params.get('sortOrder') ?? 'asc')

  const q = new URLSearchParams(params.toString())
  const query = useMemo(() => {
    if (sortBy) q.set('sortBy', sortBy)
    if (sortOrder) q.set('sortOrder', sortOrder)
    return q.toString()
  }, [sortBy, sortOrder])

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <SortDesc />
      </DrawerTrigger>
      <DrawerContent className="p-5">
        <DrawerHeader>
            <RadioGroup onValueChange={(value) => {
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
            router.push(`/products?${query}`)
            setIsOpen(false)
          }}>
            Apply
          </Button>
          <Button size="lg" variant="outline" className="w-full" onClick={() => {
            setIsOpen(false)
            setSortBy(undefined)
          }}>
            Clear
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

export default SortDrawer
