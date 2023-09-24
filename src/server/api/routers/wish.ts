import { z } from "zod";

import { idSchema } from "@/utils/validation";
import { WishStatus } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const wishRouter = createTRPCRouter({
  createWish: protectedProcedure
    .input(
      z.object({
        modelId: idSchema,
        lowerBound: z.number().int().gt(0),
        upperBound: z.number().int().gt(0),
      })
    )
    .mutation(
      async ({
        input: { modelId: id, lowerBound, upperBound },
        ctx: { prisma, session },
      }) => {
        const user = session.user;
        try {
          if (lowerBound > upperBound) {
            return new Error("Lower bound cannot be greater than upper bound");
          }

          const existingWish = await prisma.wish.findFirst({
            where: {
              userId: user.id,
              modelId: id,
            },
          });

          if (existingWish !== null) {
            return new Error("wish already exists");
          }
          const product = await prisma.product.findFirst({
            where: {
              modelId: id,
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
              user: {
                connect: {
                  id: user.id,
                },
              },
              model: {
                connect: {
                  id,
                },
              },
              lowerBound,
              upperBound,
              status,
            },
          });

          return wish;
        } catch (error) {
          return new Error("Something went wrong!");
        }
      }
    ),
  deleteWish: protectedProcedure
    .input(z.object({ wishId: idSchema }))
    .mutation(async ({ input: { wishId: id }, ctx: { prisma, session } }) => {
      const user = session.user;
      try {
        const wish = await prisma.wish.findUnique({
          where: {
            id,
          },
        });
        if (wish === null) {
          return new Error("Wish not found");
        }
        if (wish.userId !== user.id) {
          return new Error("Wish not found");
        }
        const deletedWish = await prisma.wish.delete({
          where: {
            id,
          },
        });
        return deletedWish;
      } catch (error) {
        return new Error("Something went wrong!");
      }
    }),
});
