import { idSchema } from "@/utils/validation";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { DEFAULT_LIMIT } from "@/utils/constants";
import { states } from "@/types/prisma";

export const searchRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        state: z.enum(states),
      }),
    )
    .query(async ({ input: { search, state }, ctx: { prisma } }) => {
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
            createdState: state,
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
            createdState: state,
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
            createdState: state,
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
        state: z.enum(states),
      }),
    )
    .query(
      async ({ input: { search, state }, ctx: { prisma, isAdminPage } }) => {
        const categories = await prisma.category.findMany({
          where: {
            name: search
              ? {
                  contains: search,
                }
              : undefined,
            active: isAdminPage ? undefined : true,
            createdState: state,
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
        state: z.enum(states),
      }),
    )
    .query(
      async ({ input: { search, state }, ctx: { prisma, isAdminPage } }) => {
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

            createdState: state,
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
        state: z.enum(states),
      }),
    )
    .query(
      async ({
        input: { search, categoryId, state },
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
            createdState: state,
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
        state: z.enum(states),
      }),
    )
    .query(
      async ({
        input: { search, brandId, categoryId, state },
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
            createdState: state,
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
