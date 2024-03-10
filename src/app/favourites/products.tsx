"use client"
import ListingCard from '@/components/ListingCard';
import { ProductsPayloadIncluded } from '@/types/prisma';
import { motion } from 'framer-motion';
import React from 'react'

function Favourites({ products }: { products: ProductsPayloadIncluded[] }) {
  return (
    <motion.div className="product-area mb-32 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { duration: 0.5, staggerChildren: 0.03 },
        },
      }}
      initial="hidden"
      animate="show"
      >
      {products.map((product) => (
        <ListingCard
          key={product.id}
          product={product}
        />
      ))}
    </motion.div>
  )
}

export default Favourites
