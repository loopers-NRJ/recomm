import { idSchema } from "@/utils/validation";

import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";
import { AccessType } from "@prisma/client";
import { z } from "zod";
import { DefaultLimit } from "@/utils/constants";

export const searchRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
      })
    )
    .query(async ({ input: { search }, ctx: { prisma } }) => {
      if (search.trim() === "") {
        return {
          categories: [],
          brands: [],
          models: [],
        };
      }
      const [categories, brands, models] = await prisma.$transaction([
        prisma.category.findMany({
          where: {
            name: {
              contains: search,
            },
            active: true,
          },
          take: DefaultLimit,
          select: {
            id: true,
            name: true,
            // add image if needed
            // image: true,
          },
        }),

        prisma.brand.findMany({
          where: {
            name: {
              contains: search,
            },
          },
          take: DefaultLimit,
          select: {
            id: true,
            name: true,
            // add image if needed
            // image: true,
          },
        }),

        prisma.model.findMany({
          where: {
            name: {
              contains: search,
            },
          },
          take: DefaultLimit,
          select: {
            id: true,
            name: true,
            // add image if needed
            // image: true,
          },
        }),
      ]);

      return {
        categories,
        brands,
        models,
      };
    }),
  category: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
      })
    )
    .query(async ({ input: { search }, ctx: { prisma, isAdmin } }) => {
      const categories = await prisma.category.findMany({
        where: {
          name: {
            contains: search,
          },
          active: isAdmin ? undefined : true,
        },
        take: DefaultLimit,
        select: {
          id: true,
          name: true,
          // add image if needed
          // image: true,
        },
      });
      return categories;
    }),

  brands: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        categoryId: idSchema.optional(),
      })
    )
    .query(
      async ({ input: { search, categoryId }, ctx: { prisma, isAdmin } }) => {
        const brands = await prisma.brand.findMany({
          where: {
            name: {
              contains: search,
            },
            active: isAdmin ? undefined : true,
            models: categoryId
              ? {
                  some: {
                    categories: {
                      some: {
                        id: categoryId,
                        active: isAdmin ? undefined : true,
                      },
                    },
                  },
                }
              : undefined,
          },
          take: DefaultLimit,
          select: {
            id: true,
            name: true,
            // add image if needed
            // image: true,
          },
        });
        return brands;
      }
    ),

  models: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
      })
    )
    .query(
      async ({
        input: { search, brandId, categoryId },
        ctx: { prisma, isAdmin },
      }) => {
        const models = await prisma.model.findMany({
          where: {
            active: isAdmin ? undefined : true,
            brand: {
              active: isAdmin ? undefined : true,
            },
            brandId,
            categories: categoryId
              ? {
                  some: {
                    id: categoryId,
                    active: isAdmin ? undefined : true,
                  },
                }
              : undefined,
            name: {
              contains: search,
            },
          },
          take: DefaultLimit,
          select: {
            id: true,
            name: true,
            // add image if needed
            // image: true,
          },
        });
        return models;
      }
    ),

  role: getProcedure(AccessType.readAccess).query(
    async ({ ctx: { prisma } }) => {
      return await prisma.role.findMany({
        include: {
          accesses: true,
        },
      });
    }
  ),
});
