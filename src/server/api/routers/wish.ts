import { z } from "zod";

import { WishStatus } from "@prisma/client";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const wishRouter = createTRPCRouter({
  createWish: protectedProcedure
    .input(z.object({ modelId: z.string().cuid() }))
    .mutation(async ({ input: { modelId: id }, ctx }) => {
      const user = ctx.session.user;
      try {
        const existingWish = await ctx.prisma.wish.findFirst({
          where: {
            userId: user.id,
            modelId: id,
          },
        });

        if (existingWish !== null) {
          return new Error("wish already exists");
        }
        const product = await ctx.prisma.product.findFirst({
          where: {
            modelId: id,
            buyerId: null,
          },
        });
        const status: WishStatus =
          product !== null ? WishStatus.available : WishStatus.pending;

        const wish = await ctx.prisma.wish.create({
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
            status,
          },
        });

        return wish;
      } catch (error) {
        return new Error("Something went wrong!");
      }
    }),
  deleteWish: protectedProcedure
    .input(z.object({ wishId: z.string().cuid() }))
    .mutation(async ({ input: { wishId: id }, ctx }) => {
      const user = ctx.session.user;
      try {
        const wish = await ctx.prisma.wish.findUnique({
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
        const deletedWish = await ctx.prisma.wish.delete({
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
