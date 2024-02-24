import { idSchema } from "@/utils/validation";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  defaultLimit,
  defaultSortBy,
  defaultSortOrder,
  maxLimit,
} from "@/utils/constants";
import { z } from "zod";

export const inboxRouter = createTRPCRouter({
  all: protectedProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt", "active"])
          .default(defaultSortBy),
        cursor: idSchema.optional(),
      }),
    )
    .query(async ({ input, ctx: { prisma, session } }) => {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: session.user.id,
          title: {
            contains: input.search,
          },
        },
        take: input.limit,
        skip: input.cursor ? 1 : undefined,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: {
          [input.sortBy]: input.sortOrder,
        },
      });

      return {
        notifications,
        nextCursor: notifications[input.limit - 1]?.id,
      };
    }),
  delete: protectedProcedure
    .input(z.object({ notificationId: idSchema }))
    .mutation(async ({ input, ctx: { prisma, session } }) => {
      await prisma.notification.delete({
        where: {
          id: input.notificationId,
          userId: session.user.id,
        },
      });
    }),
  markAsRead: protectedProcedure
    .input(z.object({ notificationId: idSchema }))
    .mutation(async ({ input, ctx: { prisma, session } }) => {
      await prisma.notification.update({
        where: {
          id: input.notificationId,
          userId: session.user.id,
        },
        data: {
          read: true,
        },
      });
    }),
});
