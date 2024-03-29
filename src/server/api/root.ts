import { createTRPCRouter } from "@/server/api/trpc";

import { addressRouter } from "./routers/address";
import { brandRouter } from "./routers/brand";
import { categoryRouter } from "./routers/category";
import { modelRouter } from "./routers/model";
import { productRouter } from "./routers/product";
import { roomRounter } from "./routers/room";
import { searchRouter } from "./routers/search";
import { userRouter } from "./routers/user";
import { wishRouter } from "./routers/wish";
import { RoleRouter } from "./routers/role";
import { logRouter } from "./routers/log";
import { couponRouter } from "./routers/coupon";
import { reportRouter } from "./routers/report";
import { configurationsRouter } from "./routers/configurations";
import { inboxRouter } from "./routers/inbox";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  address: addressRouter,
  category: categoryRouter,
  brand: brandRouter,
  model: modelRouter,
  product: productRouter,
  user: userRouter,
  room: roomRounter,
  wish: wishRouter,
  role: RoleRouter,
  search: searchRouter,
  log: logRouter,
  coupon: couponRouter,
  inbox: inboxRouter,
  report: reportRouter,
  configuration: configurationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
