import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { AccessType } from "@prisma/client";
import { notFound } from "next/navigation";

const predefinedAdmins = [
  "karthick72002@gmail.com",
  "mynameisrizwan35@gmail.com",
  "imnaveenbharath@gmail.com",
  "loopers.nrj@gmail.com",
];

const predefinedCities = ["Chennai", "Bengaluru"];
const predefinedConfigurations = {
  maximumAddressPerUser: "5",
  maximumFeaturedCategory: "7",
  productSellingCount: "30",
  productSellingDurationInDays: "30",
};

/**
 * Internal API to generate access types and roles.
 * Don't forget to delete this file before deploying to production.
 */
export async function GET() {
  const session = await getServerAuthSession();
  if (!session || !predefinedAdmins.includes(session.user.email ?? "")) {
    return notFound();
  }
  try {
    for (const city of predefinedCities) {
      await prisma.city.upsert({
        where: { value: city },
        update: {},
        create: {
          value: city,
          createdBy: { connect: { id: session.user.id } },
        },
      });
    }
    for (const type of Object.values(AccessType)) {
      await prisma.access.upsert({
        where: { type: type as AccessType },
        update: {},
        create: { type: type as AccessType },
      });
    }
    let role = await prisma.role.findFirst({
      where: { name: "super admin" },
    });
    if (!role) {
      role = await prisma.role.create({
        data: {
          name: "super admin",
          accesses: {
            connect: Object.values(AccessType).map((type) => ({ type })),
          },
          createdCity: {
            connect: predefinedCities.map((value) => ({ value })),
          },
          createdBy: {
            connect: { id: session.user.id },
          },
        },
      });
    } else {
      await prisma.role.update({
        where: { id: role.id },
        data: {
          accesses: {
            connect: Object.values(AccessType).map((type) => ({ type })),
          },
        },
      });
    }

    await prisma.user.updateMany({
      where: { email: { in: predefinedAdmins } },
      data: { roleId: role.id },
    });

    for (const key in predefinedConfigurations) {
      const value =
        predefinedConfigurations[key as keyof typeof predefinedConfigurations];
      await prisma.appConfiguration.upsert({
        where: { key },
        update: {},
        create: { key, value, createdBy: { connect: { id: session.user.id } } },
      });
    }
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
