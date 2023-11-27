import { AccessType } from "@prisma/client";
import { createTRPCRouter, getProcedure } from "../trpc";
import { z } from "zod";
import { accessTypes } from "@/types/prisma";
import { idSchema } from "@/utils/validation";

export const RoleRouter = createTRPCRouter({
  getRoles: getProcedure(AccessType.readAccess).query(
    async ({ ctx: { prisma } }) => {
      return prisma.role.findMany();
    }
  ),
  getRole: getProcedure(AccessType.readAccess)
    .input(z.object({ id: idSchema }))
    .query(async ({ input: { id }, ctx: { prisma } }) => {
      return prisma.role.findUnique({
        where: { id },
        include: { accesses: true },
      });
    }),
  createRole: getProcedure(AccessType.createRole)
    .input(
      z.object({
        name: z.string(),
        accesses: z.array(z.enum(accessTypes)),
      })
    )
    .mutation(async ({ input: { name, accesses }, ctx: { prisma } }) => {
      return prisma.role.create({
        data: {
          name,
          accesses: {
            connect: accesses.map((access) => ({ type: access })),
          },
        },
      });
    }),
  deleteRole: getProcedure(AccessType.deleteRole)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx: { prisma } }) => {
      return prisma.role.delete({ where: { id } });
    }),
});
