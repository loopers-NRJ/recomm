import { functionalityOptions } from "@/utils/validation";
import { createTRPCRouter, publicProcedure } from "../trpc";
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
});
