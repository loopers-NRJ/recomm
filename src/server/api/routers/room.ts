import { z } from "zod";

import { idSchema } from "@/utils/validation";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

import type { PrismaClient } from "@prisma/client";
import { defaultLimit, defaultSortOrder, maxLimit } from "@/utils/constants";
import { getLogger } from "@/utils/logger";

export const roomRounter = createTRPCRouter({
  getBidsByRoomId: publicProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        cursor: idSchema.optional(),
        roomId: idSchema,
      }),
    )
    .query(
      async ({
        input: { roomId: id, limit, sortOrder, cursor },
        ctx: { prisma },
      }) => {
        const bids = await prisma.bid.findMany({
          where: {
            roomId: id,
          },

          take: limit,
          skip: cursor ? 1 : undefined,
          cursor: cursor
            ? {
                id: cursor,
              }
            : undefined,
          orderBy: [
            {
              price: sortOrder,
            },
          ],
          include: {
            user: true,
          },
        });
        return {
          bids,
          nextCursor: bids[limit - 1]?.id,
        };
      },
    ),

  getHighestBidByRoomId: publicProcedure
    .input(z.object({ roomId: idSchema }))
    .query(async ({ input: { roomId: id }, ctx: { prisma } }) => {
      return getHighestBidByRoomId(id, prisma);
    }),

  createBid: protectedProcedure
    .input(
      z.object({
        roomId: idSchema,
        price: z.number().int().gt(0),
      }),
    )
    .mutation(
      async ({ input: { price, roomId }, ctx: { prisma, session } }) => {
        return createABid({
          price,
          roomId,
          userId: session.user.id,
          prisma,
        });
      },
    ),

  deleteBid: protectedProcedure
    .input(z.object({ bidId: idSchema }))
    .mutation(
      async ({ input: { bidId }, ctx: { prisma, session, logger } }) => {
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
        if (bid === null || bid.room.product === null) {
          return "Bid not found";
        }

        if (
          // this condition allows user to delete their own bid
          bid.user.id !== session.user.id &&
          // this condition allows seller to delete bid of other users
          bid.room.product.sellerId !== session.user.id
        ) {
          return "You cannot delete this bid";
        }

        // using void to ignore the returning promise
        void prisma.bid
          .delete({
            where: {
              id: bidId,
            },
          })
          .catch(async (error) => {
            await logger.error(
              "error deleting bid",
              JSON.stringify({
                procedure: "deleteABid",
                error,
              }),
            );
          });
      },
    ),
});

export const getHighestBidByRoomId = async (
  id: string,
  prisma: PrismaClient,
) => {
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
};

const createABid = ({
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
    const room = await prisma.room.findUnique({
      where: {
        id: roomId,
      },
      include: {
        product: true,
      },
    });
    if (room === null) {
      return "Room not found";
    }
    if (room.product === null) {
      return "Product you are trying to bid was not found, try again later";
    }
    if (room.product.price >= price) {
      return "Bid amount too low";
    }
    if (room.product.sellerId === userId) {
      return "You cannot bid on your own product";
    }
    if (room.product.buyerId != null) {
      return "Product already sold";
    }

    let highestBid;
    try {
      highestBid = await getHighestBidByRoomId(roomId, prisma as PrismaClient);
    } catch (error) {
      await getLogger(prisma as PrismaClient).error(
        "error creating a bid",
        JSON.stringify({
          procedure: "createABid",
          error,
        }),
      );
      return "Something went wrong";
    }

    // this condition block user from bidding twice
    if (highestBid !== null && highestBid.userId === userId) {
      return "You are already the highest bidder";
    }
    // this condition decides whether to allow user to bid lesser than or equal to the highest bid
    // if (highestBid.price >= price) {
    //   return ("Bid is too low");
    // }

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
  });
};
