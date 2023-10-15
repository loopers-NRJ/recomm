import { prisma } from "@/server/db";
import { AccessType } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse
) {
  console.log(request.body);
  try {
    await prisma.access.createMany({
      data: Object.keys(AccessType).map((key) => ({
        type: AccessType[key as AccessType],
      })),
    });
  } catch (error) {
    return response.send(
      "something went wrong, may be access already generated."
    );
  }
  return response.send("Access types generated.");
}
