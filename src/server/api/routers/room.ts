import { functionalityOptions } from "@/utils/validation";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";

export const roomRounter = createTRPCRouter({
  getBidsByRoomId: publicProcedure
    .input(
      functionalityOptions
        .pick({ limit: true, page: true, sortOrder: true })
        .extend({ roomId: z.string().cuid() })
    )
    .query(async ({ input: { roomId: id, limit, page, sortOrder }, ctx }) => {
      try {
        const room = await ctx.prisma.room.findUnique({
          where: {
            id,
          },
        });
        if (room === null) {
          return new Error("Room not found");
        }
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
  postABid: protectedProcedure
    .input(
      z.object({ roomId: z.string().cuid(), price: z.number().int().gt(0) })
    )
    .mutation(
      async ({ input: { price, roomId }, ctx: { prisma, session } }) => {
        const userId = session.user.id;
        try {
          return prisma.$transaction(async (prisma) => {
            const room = await prisma.room.findUnique({
              where: {
                id: roomId,
              },
              include: {
                highestBid: true,
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
            // if (room.highestBid !== null && room.highestBid.price >= price) {
            //   return new Error("Bid is too low");
            // }
            if (room.highestBid !== null) {
              await prisma.bid.update({
                where: {
                  id: room.highestBid.id,
                },
                data: {
                  highestBidedRoom: {
                    disconnect: true,
                  },
                },
              });
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
                highestBidedRoom: {
                  connect: {
                    id: roomId,
                  },
                },
              },
            });
            return bid;
          });
        } catch (error) {
          return new Error("cannot create bid");
        }
      }
    ),
});
