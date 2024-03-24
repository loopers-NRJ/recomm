import { z } from "zod";
import { createTRPCRouter, getProcedure, protectedProcedure } from "../trpc";
import { idSchema } from "@/utils/validation";
import { AccessType } from "@prisma/client";

export const variantRouter = createTRPCRouter({
  allByCategoryId: protectedProcedure
    .input(z.object({ categoryId: idSchema }))
    .query(({ input: { categoryId }, ctx: { prisma } }) => {
      return prisma.variant.findMany({
        where: { categoryId },
      });
    }),

  create: getProcedure((accessTypes) =>
    accessTypes.some(
      (accessType) =>
        accessType === AccessType.createCategory ||
        accessType === AccessType.updateCategory,
    ),
  )
    .input(
      z.object({
        title: z
          .string()
          .trim()
          .min(1, { message: "Empty text cannot be a variant" }),
        categoryId: idSchema,
      }),
    )
    .mutation(
      async ({
        input: { categoryId, title },
        ctx: { prisma, session, logger },
      }) => {
        console.log(title);
        const variant = await prisma.variant.findUnique({
          where: {
            categoryId_title: {
              categoryId,
              title,
            },
          },
        });
        if (variant !== null) {
          return "Variant already exists" as const;
        }
        const created = await prisma.variant.create({
          data: {
            title,
            categoryId,
          },
          include: { category: true },
        });

        await logger.info({
          city: created.category.cityValue ?? "common",
          message: `${session.user.name} created a variant in ${created.category.name} called ${created.title}`,
        });

        return created;
      },
    ),

  update: getProcedure((accessTypes) =>
    accessTypes.some(
      (accessType) =>
        accessType === AccessType.createCategory ||
        accessType === AccessType.updateCategory,
    ),
  )
    .input(
      z.object({
        title: z
          .string()
          .trim()
          .min(1, { message: "Empty text cannot be a variant" }),
        variantId: idSchema,
      }),
    )
    .mutation(
      async ({
        input: { title, variantId },
        ctx: { prisma, session, logger },
      }) => {
        const variant = await prisma.variant.findUnique({
          where: { id: variantId },
          include: { category: true },
        });
        if (variant === null) {
          return "Variant not found" as const;
        }

        const existing = await prisma.variant.findUnique({
          where: {
            categoryId_title: {
              title,
              categoryId: variant.category.id,
            },
          },
          include: { category: true },
        });
        if (existing !== null) {
          return "Variant title already exist" as const;
        }

        const updated = await prisma.variant.update({
          where: { id: variantId },
          data: { title, updatedBy: { connect: { id: session.user.id } } },
        });
        await logger.info({
          city: variant.category.cityValue ?? "common",
          message: `${session.user.name} updated a variant in ${variant.category.name} from ${variant.title} to ${updated.title}`,
        });
        return updated;
      },
    ),

  delete: getProcedure((accessTypes) =>
    accessTypes.some(
      (accessType) =>
        accessType === AccessType.createCategory ||
        accessType === AccessType.updateCategory,
    ),
  )
    .input(
      z.object({
        variantId: idSchema,
      }),
    )
    .mutation(
      async ({ input: { variantId }, ctx: { prisma, session, logger } }) => {
        const variant = await prisma.variant.findUnique({
          where: { id: variantId },
          include: { category: true },
        });
        if (variant === null) {
          return "Variant not found" as const;
        }
        const updated = await prisma.variant.delete({
          where: { id: variantId },
        });
        await logger.info({
          city: variant.category.cityValue ?? "common",
          message: `${session.user.name} deleted a variant in ${variant.category.name} called ${variant.title}`,
        });
        return updated;
      },
    ),
});
