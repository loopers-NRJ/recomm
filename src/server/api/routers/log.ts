import { AccessType } from "@prisma/client";
import { createTRPCRouter, getProcedure } from "../trpc";
import { z } from "zod";
import { idSchema } from "@/utils/validation";
import { defaultLimit, defaultSortOrder, maxLimit } from "@/utils/constants";
import { logLevel } from "@/utils/logger";

export const logRouter = createTRPCRouter({
  all: getProcedure([AccessType.readAccess])
    .input(
      z.object({
        search: z.string().trim().optional(),
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        sortBy: z.enum(["level", "createdAt"]).default("createdAt"),
        cursor: idSchema.optional(),
        level: z.enum(logLevel).optional(),
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
        },
        orderBy: {
          [input.sortBy]: input.sortOrder,
        },
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
});
