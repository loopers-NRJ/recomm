import { idSchema } from "@/utils/validation";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { DEFAULT_LIMIT } from "@/utils/constants";

export const searchRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        city: z.string().trim().min(1).optional(),
      }),
    )
    .query(async ({ input: { search, city }, ctx: { prisma } }) => {
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
            cityValue: city,
          },

          take: DEFAULT_LIMIT,
          select: {
            slug: true,
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
            active: true,
            cityValue: city,
          },
          take: DEFAULT_LIMIT,
          select: {
            slug: true,
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
            active: true,
            cityValue: city,
          },
          take: DEFAULT_LIMIT,
          select: {
            slug: true,
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
        city: z.string().trim().min(1).optional(),
      }),
    )
    .query(
      async ({ input: { search, city }, ctx: { prisma, isAdminPage } }) => {
        const categories = await prisma.category.findMany({
          where: {
            name: search
              ? {
                  contains: search,
                }
              : undefined,
            active: isAdminPage ? undefined : true,
            cityValue: city,
          },
          take: DEFAULT_LIMIT,
          select: {
            id: true,
            name: true,
            // add image if needed
            // image: true,
          },
        });
        return categories;
      },
    ),
  leafCategory: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        city: z.string().trim().min(1).optional(),
      }),
    )
    .query(
      async ({ input: { search, city }, ctx: { prisma, isAdminPage } }) => {
        const categories = await prisma.category.findMany({
          where: {
            name: search
              ? {
                  contains: search,
                }
              : undefined,
            active: isAdminPage ? undefined : true,
            subCategories: {
              none: {},
            },

            cityValue: city,
          },
          take: DEFAULT_LIMIT,
          select: {
            id: true,
            name: true,
          },
        });
        return categories;
      },
    ),

  brands: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        categoryId: idSchema.optional(),
        city: z.string().trim().min(1).optional(),
      }),
    )
    .query(
      async ({
        input: { search, categoryId, city },
        ctx: { prisma, isAdminPage },
      }) => {
        const brands = await prisma.brand.findMany({
          where: {
            name: search
              ? {
                  contains: search,
                }
              : undefined,
            active: isAdminPage ? undefined : true,
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
            cityValue: city,
          },
          take: DEFAULT_LIMIT,
          select: {
            id: true,
            name: true,
            // add image if needed
            // image: true,
          },
        });
        return brands;
      },
    ),

  models: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        city: z.string().trim().min(1).optional(),
      }),
    )
    .query(
      async ({
        input: { search, brandId, categoryId, city },
        ctx: { prisma, isAdminPage },
      }) => {
        const models = await prisma.model.findMany({
          where: {
            active: isAdminPage ? undefined : true,
            brand: {
              active: isAdminPage ? undefined : true,
            },
            brandId,
            category: categoryId
              ? {
                  id: categoryId,
                  active: isAdminPage ? undefined : true,
                }
              : undefined,
            name: search
              ? {
                  contains: search,
                }
              : undefined,
            cityValue: city,
          },
          take: DEFAULT_LIMIT,
          select: {
            id: true,
            name: true,
            // add image if needed
            // image: true,
          },
        });
        return models;
      },
    ),
});
