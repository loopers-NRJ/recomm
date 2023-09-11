import { z } from "zod";

import { functionalityOptions } from "@/utils/validation";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import type { PrismaClient } from "@prisma/client";

export const roomRounter = createTRPCRouter({
  getBidsByRoomId: publicProcedure
    .input(
      functionalityOptions
        .pick({ limit: true, page: true, sortOrder: true })
        .extend({ roomId: z.string().cuid() })
    )
    .query(async ({ input: { roomId: id, limit, page, sortOrder }, ctx }) => {
      try {
        // const room = await ctx.prisma.room.findUnique({
        //   where: {
        //     id,
        //   },
        // });
        // if (room === null) {
        //   return new Error("Room not found");
        // }
        const bids = await ctx.prisma.bid.findMany({
          where: {
            roomId: id,
          },
          skip: limit * (page - 1),
          take: limit,
          orderBy: [
            {
              price: sortOrder,
            },
          ],
          include: {
            user: true,
          },
        });
        return bids;
      } catch (error) {
        return new Error("Error fetching room");
      }
    }),

  getHighestBidByRoomId: publicProcedure
    .input(z.object({ roomId: z.string().cuid() }))
    .query(async ({ input: { roomId: id }, ctx }) => {
      return getHighestBidByRoomId(id, ctx.prisma);
    }),

  createBid: protectedProcedure
    .input(
      z.object({
        roomId: z.string().cuid(),
        price: z.number().int().gt(0),
      })
    )
    .mutation(async ({ input: { price, roomId }, ctx }) => {
      return createABid({
        price,
        roomId,
        userId: ctx.session.user.id,
        prisma: ctx.prisma,
      });
    }),

  deleteBid: protectedProcedure
    .input(z.object({ bidId: z.string().cuid() }))
    .mutation(async ({ input: { bidId }, ctx: { prisma, session } }) => {
      const bid = await prisma.bid.findUnique({
        where: {
          id: bidId,
        },
        include: {
          user: true,
          room: {
            include: {
              product: true,
            },
          },
        },
      });
      // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
      if (bid === null || bid.room === null || bid.room.product === null) {
        return new Error("Bid not found");
      }

      if (
        // this condition allows user to delete their own bid
        bid.user.id !== session.user.id &&
        // this condition allows seller to delete bid of other users
        bid.room.product.sellerId !== session.user.id
      ) {
        return new Error("You cannot delete this bid");
      }

      // using void to ignore the returning promise
      void prisma.bid
        .delete({
          where: {
            id: bidId,
          },
        })
        .catch((error) => {
          console.error({
            procedure: "deleteABid",
            error,
          });
        });
    }),
});

export const getHighestBidByRoomId = async (
  id: string,
  prisma: PrismaClient
) => {
  try {
    const bid = await prisma.bid.findFirst({
      where: {
        roomId: id,
      },
      include: {
        user: true,
      },
      orderBy: {
        price: "desc",
      },
    });
    return bid;
  } catch (error) {
    return new Error("Error fetching room");
  }
};

export const createABid = ({
  price,
  roomId,
  userId,
  prisma,
}: {
  prisma: PrismaClient;
  price: number;
  roomId: string;
  userId: string;
}) => {
  return prisma.$transaction(async (prisma) => {
    try {
      const room = await prisma.room.findUnique({
        where: {
          id: roomId,
        },
        include: {
          product: true,
        },
      });
      if (room === null) {
        return new Error("Room not found");
      }
      if (room.product === null) {
        return new Error(
          "Product you are trying to bid was not found, try again later"
        );
      }
      if (room.product.price >= price) {
        return new Error("Bid amount too low");
      }
      if (room.product.sellerId === userId) {
        return new Error("You cannot bid on your own product");
      }
      if (room.product.buyerId != null) {
        return new Error("Product already sold");
      }
      const highestBid = await getHighestBidByRoomId(
        roomId,
        prisma as PrismaClient
      );

      if (highestBid !== null && !(highestBid instanceof Error)) {
        // this condition block user from bidding twice
        if (highestBid.userId === userId) {
          return new Error("You are already the highest bidder");
        }
        // this condition decides whether to allow user to bid lesser than or equal to the highest bid
        // if (highestBid.price >= price) {
        //   return new Error("Bid is too low");
        // }
      }

      const bid = await prisma.bid.create({
        data: {
          price,
          room: {
            connect: {
              id: roomId,
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
        include: {
          user: true,
        },
      });

      return bid;
    } catch (error) {
      return new Error("cannot create bid");
    }
  });
};
