import slugify from "@/lib/slugify";
import { BrandPayload } from "@/types/prisma";
import {
  DEFAULT_LIMIT,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  MAXIMUM_LIMIT,
} from "@/utils/constants";
import { idSchema } from "@/utils/validation";
import { AccessType } from "@prisma/client";
import { z } from "zod";
import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";

export const brandRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z
          .number()
          .int()
          .positive()
          .max(MAXIMUM_LIMIT)
          .default(DEFAULT_LIMIT),
        sortOrder: z.enum(["asc", "desc"]).default(DEFAULT_SORT_ORDER),
        sortBy: z
          .enum([
            "name",
            "createdAt",
            "updatedAt",
            "createdBy",
            "updatedBy",
            "active",
          ])
          .default(DEFAULT_SORT_BY),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        city: z.string().trim().min(1).optional(),
      }),
    )
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, categoryId, cursor, city },
        ctx: { prisma, isAdminPage },
      }) => {
        const brands = await prisma.brand.findMany({
          where: {
            name: {
              contains: search,
            },
            models: categoryId
              ? {
                  some: {
                    category: {
                      id: categoryId,
                      active: isAdminPage ? undefined : true,
                    },
                  },
                }
              : undefined,
            active: isAdminPage ? undefined : true,
            cityValue: city,
          },
          take: limit,
          skip: cursor ? 1 : undefined,
          cursor: cursor
            ? {
                id: cursor,
              }
            : undefined,
          orderBy: [
            sortBy === "createdBy"
              ? {
                  createdBy: {
                    name: sortOrder,
                  },
                }
              : sortBy === "updatedBy"
                ? {
                    updatedBy: {
                      name: sortOrder,
                    },
                  }
                : {
                    [sortBy]: sortOrder,
                  },
          ],
          include: BrandPayload.include,
        });

        return {
          brands,
          nextCursor: brands[limit - 1]?.id,
        };
      },
    ),

  byId: publicProcedure
    .input(z.object({ brandId: idSchema }))
    .query(async ({ input: { brandId: id }, ctx: { prisma } }) => {
      const brand = await prisma.brand.findUnique({
        where: {
          id,
        },
        include: BrandPayload.include,
      });
      if (brand === null) {
        return "Brand not found";
      }
      return brand;
    }),

  bySlug: publicProcedure
    .input(z.object({ brandSlug: z.string().trim().min(1).max(255) }))
    .query(async ({ input: { brandSlug: slug }, ctx: { prisma } }) => {
      return await prisma.brand.findUnique({
        where: {
          slug: slug,
          active: true,
        },
      });
    }),

  create: getProcedure(AccessType.createBrand)
    .input(
      z.object({
        name: z.string().trim().min(1),
        city: z.string().trim().min(1),
      }),
    )
    .mutation(
      async ({ input: { name, city }, ctx: { prisma, session, logger } }) => {
        // checking whether the brand exists
        const existingBrand = await prisma.brand.findFirst({
          where: {
            name,
            cityValue: city,
          },
        });
        if (existingBrand !== null) {
          return "Brand already exists";
        }
        // creating the brand
        const brand = await prisma.brand.create({
          data: {
            name,
            slug: slugify(name),
            createdCity: {
              connect: {
                value: city,
              },
            },
            createdBy: {
              connect: {
                id: session.user.id,
              },
            },
          },
        });
        await logger.info({
          message: `'${session.user.name}' created a brand named '${brand.name}'`,
          city: city,
        });
        return brand;
      },
    ),
  update: getProcedure(AccessType.updateBrand)
    .input(
      z.union([
        z.object({
          id: idSchema,
          name: z.string().trim().min(1).max(255),
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().trim().min(1).max(255).optional(),
          active: z.boolean(),
        }),
      ]),
    )
    .mutation(
      async ({
        input: { id, name: newName, active },
        ctx: { prisma, session, logger },
      }) => {
        // checking whether the brand exists
        const existingBrand = await prisma.brand.findUnique({
          where: {
            id,
          },
          select: {
            name: true,
            active: true,
            cityValue: true,
          },
        });
        if (existingBrand === null) {
          return "Brand not found";
        }
        // checking whether the new brand name already exists
        if (newName !== undefined && newName !== existingBrand.name) {
          const existingName = await prisma.brand.findFirst({
            where: {
              name: {
                equals: newName,
              },
              cityValue: existingBrand.cityValue,
            },
            select: {
              id: true,
            },
          });
          if (existingName !== null) {
            return "Brand already exists";
          }
        }
        const brand = await prisma.brand.update({
          where: {
            id,
          },
          data: {
            name: newName,
            slug: newName ? slugify(newName) : undefined,
            active,
            updatedBy: {
              connect: {
                id: session.user.id,
              },
            },
          },
        });
        if (newName) {
          await logger.info({
            message: `'${session.user.name}' updated a brand's name from '${existingBrand.name}' to '${brand.name}'`,
            city: existingBrand.cityValue,
          });
        }
        if (active !== undefined) {
          await logger.info({
            message: `'${session.user.name}' updated a brand's active state from '${existingBrand.active}' to '${brand.active}'`,
            city: existingBrand.cityValue,
          });
        }

        return brand;
      },
    ),
  delete: getProcedure(AccessType.deleteBrand)
    .input(z.object({ brandId: idSchema }))
    .mutation(
      async ({ input: { brandId: id }, ctx: { prisma, session, logger } }) => {
        const existingBrand = await prisma.brand.findUnique({
          where: {
            id,
          },
        });
        if (existingBrand === null) {
          return "Brand not found";
        }
        const brand = await prisma.brand.delete({
          where: {
            id,
          },
        });

        await logger.info({
          message: `'${session.user.name}' deleted a brand named '${brand.name}'`,
          city: existingBrand.cityValue,
        });
        return brand;
      },
    ),
});
