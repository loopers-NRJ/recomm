import { createNextApiHandler } from "@trpc/server/adapters/next";
import { env } from "@/env.mjs";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

// export API handler
export default createNextApiHandler({
  router: appRouter,
  createContext: createTRPCContext,
  onError:
    env.NODE_ENV === "development"
      ? ({ path, error, type, input }) => {
          if (error.code === "INTERNAL_SERVER_ERROR") {
            console.error({ path, error, type, input });
          }
        }
      : undefined,
});
