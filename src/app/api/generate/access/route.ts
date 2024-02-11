import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { AccessType } from "@prisma/client";

const predefinedAdmins = ["karthick72002@gmail.com"];

export async function GET() {
  const session = await getServerAuthSession();
  if (!session) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }
  try {
    await prisma.role.deleteMany({});
    await prisma.access.deleteMany({});
    await prisma.access.createMany({
      data: Object.keys(AccessType).map((key) => ({
        type: AccessType[key as AccessType],
      })),
    });
    const role = await prisma.role.create({
      data: {
        name: "super admin",
        accesses: {
          connect: Object.values(AccessType)
            .filter(
              (type) =>
                type !== AccessType.primeSeller && type !== AccessType.seller,
            )
            .map((type) => ({ type })),
        },
      },
    });
    await prisma.user.updateMany({
      where: { email: { in: predefinedAdmins } },
      data: { roleId: role.id },
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
