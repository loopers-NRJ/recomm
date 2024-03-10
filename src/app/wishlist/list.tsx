"use client"

import { motion } from 'framer-motion'
import React from 'react'
import WishCard from './wish-card'
import type { WishPayloadIncluded } from '@/types/prisma'

function List({wishes} : {wishes: WishPayloadIncluded[]}) {
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
      className="list flex flex-col items-center w-full mt-10 space-y-3">
      {wishes.map((wish) => (
        <WishCard wish={wish} key={wish.id} />
      ))}
    </motion.div>
  )
}

export default List
