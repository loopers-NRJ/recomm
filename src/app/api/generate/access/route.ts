import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { AccessType } from "@prisma/client";

const predefinedAdmins = ["karthick72002@gmail.com"];

/**
 * Internal API to generate access types and roles.
 * Don't forget to delete this file before deploying to production.
 */
export async function GET() {
  const session = await getServerAuthSession();
  if (!session || !predefinedAdmins.includes(session.user.email ?? "")) {
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
          connect: Object.values(AccessType).map((type) => ({ type })),
        },
        createdBy: {
          connect: { id: session.user.id },
        },
      },
    });
    await prisma.user.updateMany({
      where: { email: { in: predefinedAdmins } },
      data: { roleId: role.id },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      "something went wrong, may be access already generated.",
      {
        status: 500,
      },
    );
  }
  return new Response("Access types generated.");
}
