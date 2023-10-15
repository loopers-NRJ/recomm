import { functionalityOptions, idSchema } from "@/utils/validation";

import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";
import { AccessType } from "@prisma/client";

export const searchRouter = createTRPCRouter({
  all: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({
        input: { search, limit, sortBy, sortOrder },
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
          const [categories, brands, models] = await prisma.$transaction([
            prisma.category.findMany({
              where: {
                name: {
                  contains: search,
                },
                active: true,
              },
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
            }),

            prisma.brand.findMany({
              where: {
                name: {
                  contains: search,
                },
              },
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
            }),

            prisma.model.findMany({
              where: {
                name: {
                  contains: search,
                },
              },
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
            }),
          ]);

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
    .input(functionalityOptions)
    .query(
      async ({
        input: { search, limit, sortBy, sortOrder, cursor },
        ctx: { prisma, isAdmin },
      }) => {
        try {
          const categories = await prisma.category.findMany({
            where: {
              name: {
                contains: search,
              },
              active: isAdmin ? undefined : true,
            },

            take: limit,
            cursor: cursor
              ? {
                  id: cursor,
                }
              : undefined,
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
            nextCursor: categories[limit - 1]?.id,
            previousCursor: cursor,
          };
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
      })
    )
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, categoryId, cursor },
        ctx: { prisma, isAdmin },
      }) => {
        try {
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
            take: limit,
            cursor: cursor
              ? {
                  id: cursor,
                }
              : undefined,
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
            brands,
            nextCursor: brands[limit - 1]?.id,
            previousCursor: cursor,
          };
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
      })
    )
    .query(
      async ({
        input: {
          limit,
          search,
          sortBy,
          sortOrder,
          brandId,
          categoryId,
          cursor,
        },
        ctx: { prisma, isAdmin },
      }) => {
        try {
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
            take: limit,

            cursor: cursor
              ? {
                  id: cursor,
                }
              : undefined,
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
            models,
            nextCursor: models[limit - 1]?.id,
            previousCursor: cursor,
          };
        } catch (error) {
          console.error({
            procedure: "search.models",
            error,
          });
          return new Error("Something went wrong!");
        }
      }
    ),

  role: getProcedure(AccessType.readAccess).query(
    async ({ ctx: { prisma } }) => {
      try {
        return await prisma.role.findMany({
          include: {
            accesses: true,
          },
        });
      } catch (error) {
        return new Error("Something went wrong!");
      }
    }
  ),
});
