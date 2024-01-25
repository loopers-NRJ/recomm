import Products from "@/components/products-area"
import { deviceTypeHeaderName, type SortBy, type SortOrder } from "@/utils/constants"
import { headers } from "next/headers"
import type { FC } from "react"

interface SearchParams {
  search?: string
  sortBy: SortBy
  sortOrder: SortOrder
  modelId?: string
  categoryId?: string
  brandId?: string
}

const ProductsPage: FC<SearchParams> = (props) => {
  const device = headers().get(deviceTypeHeaderName)
  return (
    <>
      <Products {...props} />
    </>
  )
}

export default ProductsPage
