import { prisma } from "@/server/db";
import { AccessType } from "@prisma/client";

export async function GET(request: Request) {
  console.log(request.body);
  try {
    await prisma.role.deleteMany({});
    await prisma.access.deleteMany({});
    await prisma.access.createMany({
      data: Object.keys(AccessType).map((key) => ({
        type: AccessType[key as AccessType],
      })),
    });
    await prisma.role.create({
      data: {
        name: "super admin",
        accesses: {
          connect: Object.values(AccessType)
            .filter(
              (type) =>
                type !== AccessType.retailer && type !== AccessType.subscriber,
            )
            .map((type) => ({ type })),
        },
      },
    });
  } catch (error) {
    return new Response(
      "something went wrong, may be access already generated.",
      {
        status: 500,
      },
    );
  }
  return new Response("Access types generated.");
}
