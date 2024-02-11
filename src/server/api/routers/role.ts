import { AccessType } from "@prisma/client";
import { createTRPCRouter, getProcedure } from "../trpc";
import { z } from "zod";
import { RolePayload, accessTypes } from "@/types/prisma";
import { idSchema } from "@/utils/validation";
import { defaultSortOrder } from "@/utils/constants";

const hasRoleAccess = (types: AccessType[]) =>
  types.some(
    (type) =>
      type === AccessType.createRole ||
      type === AccessType.updateRole ||
      type === AccessType.deleteRole,
  );

export const RoleRouter = createTRPCRouter({
  all: getProcedure(hasRoleAccess)
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
  byId: getProcedure(hasRoleAccess)
    .input(z.object({ id: idSchema }))
    .query(async ({ input: { id }, ctx: { prisma } }) => {
      return prisma.role.findUnique({
        where: { id },
        include: { accesses: true },
      });
    }),
  create: getProcedure(AccessType.createRole)
    .input(
      z.object({
        name: z.string(),
        accesses: z.array(z.enum(accessTypes)),
      }),
    )
    .mutation(
      async ({
        input: { name, accesses },
        ctx: { prisma, session, logger },
      }) => {
        const existingRole = await prisma.role.findFirst({ where: { name } });
        if (existingRole) {
          return "Role already exists";
        }
        if (accesses.length === 0) {
          return "Role must have at least one access";
        }
        const role = await prisma.role.create({
          data: {
            name,
            accesses: {
              connect: accesses.map((access) => ({ type: access })),
            },
            createdBy: {
              connect: { id: session.user.id },
            },
            // createdState: state,
          },
        });
        await logger.info({
          message: `'${session.user.name}' created a role named '${role.name}'`,
          state: "common",
        });
        return role;
      },
    ),
  delete: getProcedure(AccessType.deleteRole)
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx: { prisma, session, logger } }) => {
      const existingRole = await prisma.role.findFirst({ where: { id } });
      if (!existingRole) {
        return "Role not found";
      }
      const role = await prisma.role.delete({ where: { id } });
      await logger.info({
        message: `'${session.user.name}' deleted a role named '${role.name}'`,
        state: "common",
      });
      return role;
    }),
  addAccess: getProcedure(AccessType.updateRole)
    .input(
      z.object({
        roleId: idSchema,
        accesses: z.array(z.enum(accessTypes)).nonempty(),
      }),
    )
    .mutation(
      async ({
        input: { roleId, accesses: access },
        ctx: { prisma, session, logger },
      }) => {
        const existingRole = await prisma.role.findFirst({
          where: { id: roleId },
        });
        if (!existingRole) {
          return "Role not found";
        }

        const role = await prisma.role.update({
          where: { id: roleId },
          data: {
            accesses: {
              connect: access.map((access) => ({ type: access })),
            },
            updatedBy: {
              connect: { id: session.user.id },
            },
          },
        });
        await logger.info({
          message: `'${session.user.name}' added access '${access.join(
            ", ",
          )}' to a role named '${existingRole.name}'`,
          state: "common",
        });
        return role;
      },
    ),
  removeAccess: getProcedure(AccessType.updateRole)
    .input(
      z.object({
        roleId: idSchema,
        accesses: z.array(z.enum(accessTypes)).nonempty(),
      }),
    )
    .mutation(
      async ({
        input: { roleId, accesses: access },
        ctx: { prisma, session, logger },
      }) => {
        const existingRole = await prisma.role.findFirst({
          where: { id: roleId },
        });
        if (!existingRole) {
          return "Role not found";
        }
        const role = await prisma.role.update({
          where: { id: roleId },
          data: {
            accesses: {
              disconnect: access.map((access) => ({ type: access })),
            },
            updatedBy: {
              connect: { id: session.user.id },
            },
          },
        });

        await logger.info({
          message: `'${session.user.name}' removed access '${access.join(
            ", ",
          )}' to a role named '${role.name}'`,
          state: "common",
        });

        return role;
      },
    ),
});
