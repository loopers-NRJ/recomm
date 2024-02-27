"use server"

import { revalidatePath } from "next/cache";

export async function refreshFavs() {
  revalidatePath("/favorites", "page")
}
