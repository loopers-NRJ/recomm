import { getServerSession } from "next-auth";

import { createABid } from "@/server/api/routers/room";
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

  // NOT IMPORTANT
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
  const bid = await createABid({
    roomId,
    price,
    userId: session.user.id,
    prisma,
  });
  if (bid instanceof Error) {
    return response.status(400).json(bid.message);
  }

  connectedUsers.forEach((user) => {
    sendMessage(bid, user);
  });
  return response.status(200).json(bid);
};

export default requestDispatcher;
