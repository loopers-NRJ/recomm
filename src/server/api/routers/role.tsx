import { AccessType } from "@prisma/client";
import { createTRPCRouter, getProcedure } from "../trpc";
import { z } from "zod";
import { RolePayload, accessTypes } from "@/types/prisma";
import { idSchema } from "@/utils/validation";
import { defaultSortOrder } from "@/utils/constants";

export const RoleRouter = createTRPCRouter({
  getRoles: getProcedure(AccessType.readAccess)
    .input(
      z.object({
        search: z.string().trim().default(""),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
      }),
    )
    .query(async ({ input, ctx: { prisma } }) => {
      return prisma.role.findMany({
        include: RolePayload.include,
        where: {
          name: {
            contains: input.search,
          },
        },
        orderBy: {
          name: input.sortOrder,
        },
      });
    }),
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
      }),
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
  addAccessToRole: getProcedure(AccessType.updateRole)
    .input(
      z.object({
        roleId: idSchema,
        accesses: z.array(z.enum(accessTypes)).nonempty(),
      }),
    )
    .mutation(
      async ({ input: { roleId, accesses: access }, ctx: { prisma } }) => {
        return prisma.role.update({
          where: { id: roleId },
          data: {
            accesses: {
              connect: access.map((access) => ({ type: access })),
            },
          },
        });
      },
    ),
  removeAccessFromRole: getProcedure(AccessType.updateRole)
    .input(
      z.object({
        roleId: idSchema,
        accesses: z.array(z.enum(accessTypes)).nonempty(),
      }),
    )
    .mutation(
      async ({ input: { roleId, accesses: access }, ctx: { prisma } }) => {
        return prisma.role.update({
          where: { id: roleId },
          data: {
            accesses: {
              disconnect: access.map((access) => ({ type: access })),
            },
          },
        });
      },
    ),
});
