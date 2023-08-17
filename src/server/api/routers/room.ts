import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const roomRouter = createTRPCRouter({
  connect: publicProcedure.input(z.object({ roomId: z.string() })).query(() => {
    // connect the user
  }),
  newBid: protectedProcedure
    .input(
      z.object({ roomId: z.string().cuid(), price: z.number().int().gt(0) })
    )
    .mutation(({ input: { roomId, price }, ctx }) => {
      const user = ctx.session.user;
      try {
        return ctx.prisma.$transaction(async (prisma) => {
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
          if (room.product.sellerId === user.id) {
            return new Error("You cannot bid on your own product");
          }
          if (room.product.buyerId != null) {
            return new Error("Product already sold");
          }
          if (room.highestBid !== null && room.highestBid.price >= price) {
            return new Error("Bid is too low");
          }
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
                  id: user.id,
                },
              },
              highestBidedRoom: {
                connect: {
                  id: roomId,
                },
              },
            },
          });
          //   broadcast the bid to all the connected users
        });
      } catch (error) {
        return new Error("cannot create bid");
      }
    }),
});
