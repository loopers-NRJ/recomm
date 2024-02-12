import { AccessType } from "@prisma/client";
import { createTRPCRouter, getProcedure } from "../trpc";
import { z } from "zod";
import { idSchema } from "@/utils/validation";
import { defaultLimit, defaultSortOrder, maxLimit } from "@/utils/constants";
import { logLevel } from "@/utils/logger";
import { states } from "@/types/prisma";

export const logRouter = createTRPCRouter({
  all: getProcedure(AccessType.viewLogs)
    .input(
      z.object({
        search: z.string().trim().optional(),
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        sortBy: z.enum(["level", "createdAt", "state"]).default("createdAt"),
        cursor: idSchema.optional(),
        level: z.enum(logLevel).optional(),
        state: z.enum(states).nullish(),
      }),
    )
    .query(async ({ input, ctx: { prisma } }) => {
      const logs = await prisma.log.findMany({
        where: {
          message: input.search
            ? {
                contains: input.search,
              }
            : undefined,
          level: input.level,
          state: input.state,
        },
        orderBy: [
          input.sortBy === "state"
            ? { state: input.sortOrder }
            : { [input.sortBy]: input.sortOrder },
        ],
        take: input.limit,
        cursor: input.cursor
          ? {
              id: input.cursor,
            }
          : undefined,
      });

      return {
        logs,
        nextCursor: logs[input.limit - 1]?.id,
      };
    }),
  clear: getProcedure(AccessType.clearLogs).mutation(
    async ({ ctx: { prisma } }) => {
      await prisma.log.deleteMany();
    },
  ),
});
