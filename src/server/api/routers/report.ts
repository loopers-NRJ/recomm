import { AccessType } from "@prisma/client";
import { createTRPCRouter, getProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import {
  defaultLimit,
  defaultSortBy,
  defaultSortOrder,
  maxLimit,
} from "@/utils/constants";
import { idSchema } from "@/utils/validation";
import { reportPayload } from "@/types/prisma";

export const reportRouter = createTRPCRouter({
  all: getProcedure(AccessType.viewReports)
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        sortBy: z
          .enum(["productName", "userName", "createdAt", "updatedAt"])
          .default(defaultSortBy),
        cursor: idSchema.optional(),
      }),
    )
    .query(
      async ({
        input: { search, limit, sortOrder, sortBy, cursor },
        ctx: { prisma },
      }) => {
        const reports = await prisma.report.findMany({
          where: {
            product: {
              title: {
                contains: search,
              },
            },
          },
          orderBy: [
            sortBy === "productName"
              ? {
                  product: {
                    title: sortOrder,
                  },
                }
              : sortBy === "userName"
                ? {
                    user: {
                      name: sortOrder,
                    },
                  }
                : {
                    [sortBy]: sortOrder,
                  },
          ],
          take: limit,
          skip: cursor ? 1 : undefined,
          cursor: cursor ? { id: cursor } : undefined,
          include: reportPayload.include,
        });
        return {
          reports,
          nextCursor: reports[limit - 1]?.id,
        };
      },
    ),
  byId: getProcedure(AccessType.viewReports)
    .input(z.object({ id: idSchema }))
    .query(async ({ input: { id }, ctx: { prisma } }) => {
      const report = await prisma.report.findUnique({
        where: {
          id,
        },
        include: reportPayload.include,
      });
      return report;
    }),

  create: protectedProcedure
    .input(
      z.object({
        productId: idSchema,
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      const report = await prisma.report.create({
        data: {
          description: input.description,
          productId: input.productId,
          userId: session.user.id,
        },
        include: reportPayload.include,
      });
      return report;
    }),
  delete: getProcedure(AccessType.deleteReport)
    .input(z.object({ id: idSchema }))
    .mutation(async ({ ctx: { prisma }, input: { id } }) => {
      await prisma.report.delete({
        where: {
          id,
        },
      });
      return true;
    }),
});
