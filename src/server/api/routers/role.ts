import { AccessType } from "@prisma/client";
import { createTRPCRouter, getProcedure } from "../trpc";
import { z } from "zod";
import { RolePayload, accessTypes } from "@/types/prisma";
import { idSchema } from "@/utils/validation";
import { DEFAULT_SORT_ORDER } from "@/utils/constants";

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
        sortOrder: z.enum(["asc", "desc"]).default(DEFAULT_SORT_ORDER),
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
        include: RolePayload.include,
      });
    }),
  create: getProcedure(AccessType.createRole)
    .input(
      z.object({
        name: z.string().trim().min(1),
        accesses: z.array(z.enum(accessTypes)),
        cities: z.array(z.string().trim().min(1)),
      }),
    )
    .mutation(
      async ({
        input: { name, accesses, cities },
        ctx: { prisma, session, logger },
      }) => {
        const existingRole = await prisma.role.findFirst({ where: { name } });
        if (existingRole) {
          return "Role already exists";
        }
        if (accesses.length === 0) {
          return "Role must have at least one access";
        }
        if (cities.length === 0) {
          return "Role must have at least one city";
        }
        const role = await prisma.role.create({
          data: {
            name,
            accesses: {
              connect: accesses.map((access) => ({ type: access })),
            },
            createdCity: {
              connect: cities.map((city) => ({ value: city })),
            },
            createdBy: {
              connect: { id: session.user.id },
            },
          },
        });
        await logger.info({
          message: `'${session.user.name}' created a role named '${role.name}'`,
          city: "common",
        });
        return role;
      },
    ),
  delete: getProcedure(AccessType.deleteRole)
    .input(z.object({ id: idSchema }))
    .mutation(async ({ input: { id }, ctx: { prisma, session, logger } }) => {
      const existingRole = await prisma.role.findFirst({ where: { id } });
      if (!existingRole) {
        return "Role not found";
      }
      const role = await prisma.role.delete({ where: { id } });
      await logger.info({
        message: `'${session.user.name}' deleted a role named '${role.name}'`,
        city: "common",
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
        input: { roleId, accesses },
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
              connect: accesses.map((access) => ({ type: access })),
            },
            updatedBy: {
              connect: { id: session.user.id },
            },
          },
        });
        await logger.info({
          message: `'${session.user.name}' added access '${accesses.join(
            ", ",
          )}' to a role named '${existingRole.name}'`,
          city: "common",
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
        input: { roleId, accesses },
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
              disconnect: accesses.map((access) => ({ type: access })),
            },
            updatedBy: {
              connect: { id: session.user.id },
            },
          },
        });

        await logger.info({
          message: `'${session.user.name}' removed access '${accesses.join(
            ", ",
          )}' to a role named '${role.name}'`,
          city: "common",
        });

        return role;
      },
    ),

  addCity: getProcedure(AccessType.updateRole)
    .input(
      z.object({
        roleId: idSchema,
        cities: z.array(z.string().trim().min(1)),
      }),
    )
    .mutation(
      async ({
        input: { roleId, cities },
        ctx: { prisma, session, logger },
      }) => {
        if (cities.length === 0) {
          return "Select a City to add from role";
        }
        const existingRole = await prisma.role.findFirst({
          where: { id: roleId },
        });
        if (!existingRole) {
          return "Role not found";
        }

        const role = await prisma.role.update({
          where: { id: roleId },
          data: {
            createdCity: {
              connect: cities.map((city) => ({ value: city })),
            },
            updatedBy: {
              connect: { id: session.user.id },
            },
          },
        });
        await logger.info({
          message: `'${session.user.name}' added city '${cities.join(
            ", ",
          )}' to a role named '${existingRole.name}'`,
          city: "common",
        });
        return role;
      },
    ),
  removeCity: getProcedure(AccessType.updateRole)
    .input(
      z.object({
        roleId: idSchema,
        cities: z.array(z.string().trim().min(1)),
      }),
    )
    .mutation(
      async ({
        input: { roleId, cities },
        ctx: { prisma, session, logger },
      }) => {
        if (cities.length === 0) {
          return "Select a City to remove from role";
        }
        const existingRole = await prisma.role.findFirst({
          where: { id: roleId },
        });
        if (!existingRole) {
          return "Role not found";
        }
        const role = await prisma.role.update({
          where: { id: roleId },
          data: {
            createdCity: {
              disconnect: cities.map((city) => ({ value: city })),
            },
            updatedBy: {
              connect: { id: session.user.id },
            },
          },
        });

        await logger.info({
          message: `'${session.user.name}' removed city '${cities.join(
            ", ",
          )}' to a role named '${role.name}'`,
          city: "common",
        });

        return role;
      },
    ),
});
