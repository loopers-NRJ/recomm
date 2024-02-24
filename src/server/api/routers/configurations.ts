import { createTRPCRouter, getProcedure } from "../trpc";
import { z } from "zod";
import { AccessType } from "@prisma/client";

export const configurationsRouter = createTRPCRouter({
  all: getProcedure(AccessType.viewAppConfiguration).query(
    async ({ ctx: { prisma } }) => {
      return await prisma.appConfiguration.findMany();
    },
  ),
  get: getProcedure(AccessType.viewAppConfiguration)
    .input(z.string())
    .query(async ({ input: key, ctx: { prisma } }) => {
      const config = await prisma.appConfiguration.findUnique({
        where: {
          key,
        },
      });
      return config?.value ?? null;
    }),
  set: getProcedure(AccessType.updateAppConfiguration)
    .input(
      z.object({
        key: z.string(),
        value: z.string(),
      }),
    )
    .mutation(async ({ input: { key, value }, ctx: { prisma, session } }) => {
      await prisma.appConfiguration.upsert({
        where: {
          key,
        },
        update: {
          value,
          updatedBy: {
            connect: {
              id: session.user.id,
            },
          },
        },
        create: {
          key,
          value,
          createdBy: {
            connect: {
              id: session.user.id,
            },
          },
        },
      });
      return true;
    }),
});
