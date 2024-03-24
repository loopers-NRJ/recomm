import {
  AccessType,
  type PrismaClient,
  type Report,
  type User,
} from "@prisma/client";
import { createTRPCRouter, getProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import {
  DEFAULT_LIMIT,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  MAXIMUM_LIMIT,
} from "@/utils/constants";
import { idSchema } from "@/utils/validation";
import { reportPayload } from "@/types/prisma";

export const reportRouter = createTRPCRouter({
  all: getProcedure(AccessType.viewReports)
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z
          .number()
          .int()
          .positive()
          .max(MAXIMUM_LIMIT)
          .default(DEFAULT_LIMIT),
        sortOrder: z.enum(["asc", "desc"]).default(DEFAULT_SORT_ORDER),
        sortBy: z
          .enum(["productName", "userName", "createdAt", "updatedAt"])
          .default(DEFAULT_SORT_BY),
        cursor: idSchema.optional(),
        productId: idSchema,
      }),
    )
    .query(
      async ({
        input: { productId, search, limit, sortOrder, sortBy, cursor },
        ctx: { prisma },
      }) => {
        const reports = await prisma.report.findMany({
          where: {
            product: {
              id: productId,
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
        description: z.string().trim().min(1),
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

      void sendReportNotification({ prisma, report, user: session.user });
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
async function sendReportNotification({
  prisma,
  report,
  user,
}: {
  prisma: PrismaClient;
  report: Report;
  user: User;
}) {
  const admins = await prisma.user.findMany({
    where: {
      role: {
        accesses: {
          some: {
            OR: [
              {
                type: AccessType.viewReports,
              },
              {
                type: AccessType.deleteReport,
              },
            ],
          },
        },
      },
    },
    select: {
      id: true,
    },
  });

  await prisma.notification.createMany({
    data: admins.map((admin) => ({
      title: "New Report",
      link: `/admin/tables/products/${report.productId}/reports?open=${report.id}`,
      description: `User '${user.name} reported to a product'`,
      userId: admin.id,
    })),
  });
}
