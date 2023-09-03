import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";

import type { NextApiRequest, NextApiResponse } from "next";
const requestDispatcher = async (
  request: NextApiRequest,
  response: NextApiResponse
): Promise<void> => {
  switch (request.method) {
    case "GET":
      GET(request, response);
      break;
    case "POST":
      await POST(request, response);
      break;
    default:
      response.status(405).send("Method not Allowed");
  }
};

interface connectedUser {
  response: NextApiResponse;
}

const connectedUsers = new Set<connectedUser>();

export const GET = (
  request: NextApiRequest,
  response: NextApiResponse
): void => {
  const connectedUser = { response };
  connectedUsers.add(connectedUser);

  // TODO: this thing does not works. need to impelement a way to remove user from connectedUsers
  request.on("close", () => {
    connectedUsers.delete(connectedUser);
  });

  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Connection", "keep-alive");
  response.setHeader("Cache-Control", "no-cache");
  response.flushHeaders();
};

const encoder = new TextEncoder();
const sendMessage = (data: unknown, user: connectedUser): void => {
  user.response.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
};
export const POST = async (
  request: NextApiRequest,
  response: NextApiResponse
): Promise<void> => {
  const session = await getServerSession(request, response, authOptions);
  if (session === null) {
    return response.status(401).json("Unauthorized");
  }
  const roomId = request.query.roomId as string;
  const { price } = await request.body;

  const bid = await postABid({ roomId, price, userId: session.user.id });
  if (bid instanceof Error) {
    return response.status(400).json(bid.message);
  }

  connectedUsers.forEach((user) => {
    sendMessage(bid, user);
  });
  return response.status(200).json(bid);
};

const BidSchema = z.object({
  roomId: z.string().cuid(),
  price: z.number().int().gt(0),
  userId: z.string().cuid(),
});
async function postABid(input: {
  roomId: string;
  price: number;
  userId: string;
}) {
  const result = BidSchema.safeParse(input);
  if (!result.success) {
    return new Error(result.error.message);
  }
  const { roomId, price, userId } = result.data;
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

export default requestDispatcher;
