"use server"

import { api } from "@/trpc/server"

export async function toggleFavourite(productId: string) {
  "use server"
  await api.product.addToFavorites.mutate({ productId }).then(async (res) => {
    if (res === "Product is already in favorites") {
      await api.product.removeFromFavorites.mutate({ productId })
    }
  })
}
