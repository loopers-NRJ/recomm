import { functionalityOptions, idSchema } from "@/utils/validation";

import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const searchRouter = createTRPCRouter({
  all: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({
        input: { search, page, limit, sortBy, sortOrder },
        ctx: { prisma },
      }) => {
        if (search.trim() === "") {
          return {
            categories: [],
            brands: [],
            models: [],
          };
        }
        try {
          const categories = await prisma.category.findMany({
            where: {
              name: {
                contains: search,
              },
              active: true,
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

          const brands = await prisma.brand.findMany({
            where: {
              name: {
                contains: search,
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

          const models = await prisma.model.findMany({
            where: {
              name: {
                contains: search,
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
          return new Error("Something went wrong!");
        }
      }
    ),
  category: publicProcedure
    .input(functionalityOptions.extend({ active: z.boolean().default(true) }))
    .query(
      async ({
        input: { search, page, limit, sortBy, sortOrder, active },
        ctx: { prisma },
      }) => {
        try {
          const categories = await prisma.category.findMany({
            where: {
              name: {
                contains: search,
              },
              active,
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
          return new Error("Something went wrong!");
        }
      }
    ),

  brands: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: idSchema.optional(),
        active: z.boolean().default(true),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, categoryId, active },
        ctx: { prisma },
      }) => {
        try {
          const brands = await prisma.brand.findMany({
            where: {
              name: {
                contains: search,
              },
              models: categoryId
                ? {
                    some: {
                      categories: {
                        some: {
                          id: categoryId,
                          active,
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

          return new Error("Something went wrong!");
        }
      }
    ),

  models: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        active: z.boolean().default(true),
      })
    )
    .query(
      async ({
        input: {
          limit,
          page,
          search,
          sortBy,
          sortOrder,
          brandId,
          categoryId,
          active,
        },
        ctx: { prisma },
      }) => {
        try {
          const models = await prisma.model.findMany({
            where: {
              brandId,
              categories: categoryId
                ? {
                    some: {
                      id: categoryId,
                      active,
                    },
                  }
                : undefined,
              name: {
                contains: search,
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
          return new Error("Something went wrong!");
        }
      }
    ),
});
