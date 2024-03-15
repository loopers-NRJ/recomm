"use client"

import ListingCard from "@/components/ListingCard"
import LoadingProducts from "@/components/loading/LoadingProducts";
import { useClientSelectedState } from "@/store/SelectedState";
import { api } from "@/trpc/react";
import { motion } from "framer-motion"

function Products() {
  const state = useClientSelectedState((selected) => selected.state)
  const productQuery = api.product.all.useQuery({ state })

  if (productQuery.isLoading) {
    return <LoadingProducts />
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { duration: 0.5, staggerChildren: 0.03 },
        },
      }}
      initial="hidden"
      animate="show"
      className="product-area mb-32 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6"
    >
      {productQuery.data?.products.map((product) => (
        <ListingCard
          key={product.id}
          product={product}
        />
      ))}
    </motion.div>
  )
}

export default Products
