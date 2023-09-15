import { z } from "zod";

import { functionalityOptions } from "@/utils/validation";

import { createTRPCRouter, publicProcedure } from "../trpc";

export const searchRouter = createTRPCRouter({
  // all. takes functionality options and returns { categories: [Category], brands: [Brand], models: [Model] }
  all: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { search, page, limit, sortBy, sortOrder }, ctx }) => {
        if (search.trim() === "") {
          return {
            categories: [],
            brands: [],
            models: [],
          };
        }
        try {
          const categories = await ctx.prisma.category.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });

          const brands = await ctx.prisma.brand.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            skip: limit * (page - 1),
            take: limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });

          const models = await ctx.prisma.model.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });

          return {
            categories,
            brands,
            models,
          };
        } catch (error) {
          console.error({ procedure: "search.all", error });
          return new Error("Failed to fetch categories");
        }
      }
    ),
  category: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { search, page, limit, sortBy, sortOrder }, ctx }) => {
        try {
          const categories = await ctx.prisma.category.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });
          return categories;
        } catch (error) {
          console.error({ procedure: "search.category", error });
          return new Error("Failed to fetch categories");
        }
      }
    ),

  brands: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: z.string().cuid().optional(),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, categoryId },
        ctx,
      }) => {
        try {
          const brands = await ctx.prisma.brand.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
              models: categoryId
                ? {
                    some: {
                      categories: {
                        some: {
                          id: categoryId,
                        },
                      },
                    },
                  }
                : undefined,
            },
            skip: limit * (page - 1),
            take: limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });
          return brands;
        } catch (error) {
          console.error({ procedure: "search.brands", error });

          return new Error("Error fetching brands");
        }
      }
    ),

  models: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: z.string().cuid().optional(),
        brandId: z.string().cuid().optional(),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, brandId, categoryId },
        ctx,
      }) => {
        try {
          const models = await ctx.prisma.model.findMany({
            where: {
              brandId,
              categories: categoryId
                ? {
                    some: {
                      id: categoryId,
                    },
                  }
                : undefined,
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            select: {
              id: true,
              name: true,
              // add image if needed
              // image: true,
            },
          });
          return models;
        } catch (error) {
          console.error({
            procedure: "search.models",
            error,
          });
          return new Error("Error fetching models");
        }
      }
    ),
});
