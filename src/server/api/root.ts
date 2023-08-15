import { createTRPCRouter } from "@/server/api/trpc";
import { categoryRouter } from "./routers/category";
import { brandRouter } from "./routers/brand";
import { modelRouter } from "./routers/model";
import { productRouter } from "./routers/product";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  category: categoryRouter,
  brand: brandRouter,
  model: modelRouter,
  product: productRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
