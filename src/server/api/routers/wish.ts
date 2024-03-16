import { z } from "zod";

import { idSchema } from "@/utils/validation";
import { WishStatus } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const wishRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z
        .object({
          lowerBound: z.number().int().gt(0),
          upperBound: z.number().int().gt(0),
        })
        .and(
          z.union([
            z.object({
              categoryId: idSchema,
              brandId: idSchema.optional(),
              modelId: idSchema.optional(),
            }),
            z.object({
              categoryId: idSchema.optional(),
              brandId: idSchema,
              modelId: idSchema.optional(),
            }),
            z.object({
              categoryId: idSchema.optional(),
              brandId: idSchema.optional(),
              modelId: idSchema,
            }),
          ]),
        ),
    )
    .mutation(
      async ({
        input: { lowerBound, upperBound, categoryId, brandId, modelId },
        ctx: { prisma, session },
      }) => {
        const user = session.user;
        if (lowerBound > upperBound) {
          return "Lower bound cannot be greater than upper bound";
        }

        const existingWish = await prisma.wish.findFirst({
          where: {
            userId: user.id,
            model: {
              id: modelId,
              brandId,
              categoryId,
            },
            lowerBound,
            upperBound,
          },
        });

        if (existingWish !== null) {
          return "wish already exists";
        }
        const product = await prisma.product.findFirst({
          where: {
            model: {
              id: modelId,
              brandId,
              categoryId,
            },
            buyerId: null,
            price: {
              gte: lowerBound,
              lte: upperBound,
            },
          },
        });
        const status: WishStatus =
          product !== null ? WishStatus.available : WishStatus.pending;

        const wish = await prisma.wish.create({
          data: {
            lowerBound,
            upperBound,
            status,
            user: {
              connect: {
                id: user.id,
              },
            },
            category: categoryId
              ? {
                  connect: {
                    id: categoryId,
                  },
                }
              : undefined,
            brand: brandId
              ? {
                  connect: {
                    id: brandId,
                  },
                }
              : undefined,
            model: modelId
              ? {
                  connect: {
                    id: modelId,
                  },
                }
              : undefined,
          },
        });
        return wish;
      },
    ),
  delete: protectedProcedure
    .input(z.object({ wishId: idSchema }))
    .mutation(async ({ input: { wishId: id }, ctx: { prisma, session } }) => {
      const user = session.user;
      const wish = await prisma.wish.findUnique({
        where: {
          id,
        },
      });
      if (wish === null) {
        return "Wish not found";
      }
      if (wish.userId !== user.id) {
        return "Wish not found";
      }
      const deletedWish = await prisma.wish.delete({
        where: {
          id,
        },
      });
      return deletedWish;
    }),
});
