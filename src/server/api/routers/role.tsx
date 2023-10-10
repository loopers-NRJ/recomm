import { AccessType } from "@prisma/client";
import { createTRPCRouter, getProcedure } from "../trpc";

export const RoleRouter = createTRPCRouter({
  getRoles: getProcedure(AccessType.readAccess).query(
    async ({ ctx: { prisma } }) => {
      return prisma.role.findMany();
    }
  ),
});
