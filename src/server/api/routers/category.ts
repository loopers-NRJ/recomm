import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { functionalityOptions } from "@/utils/validation";

export const categoryRouter = createTRPCRouter({
  getCategories: publicProcedure
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
          });
          return categories;
        } catch (error) {
          console.error(error);
          return new Error("Failed to fetch categories");
        }
      }
    ),
  getCategoryById: publicProcedure
    .input(z.object({ categoryId: z.string().cuid() }))
    .query(async ({ input: { categoryId: id }, ctx }) => {
      try {
        const category = await ctx.prisma.category.findUnique({
          where: {
            id,
          },
        });
        if (category === null) {
          return new Error("Category does not exist");
        }
        return category;
      } catch (error) {
        console.error(error);
        return new Error("Failed to fetch category");
      }
    }),
  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        picture: z.string().url(),
      })
    )
    .mutation(async ({ input: { name, picture }, ctx }) => {
      try {
        const existingCategory = await ctx.prisma.category.findUnique({
          where: {
            name,
          },
        });
        if (existingCategory !== null) {
          return new Error(`Category with name: ${name} already exists`);
        }
        const category = await ctx.prisma.category.create({
          data: {
            name,
            picture,
          },
        });
        return category;
      } catch (error) {
        return new Error(`Cannot create the category with name: ${name}`);
      }
    }),
  updateCategoryById: adminProcedure
    .input(
      z.union([
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255),
          picture: z.string().url().optional(),
        }),
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255).optional(),
          picture: z.string().url(),
        }),
      ])
    )
    .mutation(async ({ input: { id, name, picture }, ctx }) => {
      try {
        const existingCategory = await ctx.prisma.category.findUnique({
          where: {
            id,
          },
        });
        if (existingCategory === null) {
          return new Error("Category does not exist");
        }
        const existingCategoryName = await ctx.prisma.category.findUnique({
          where: {
            name,
          },
        });
        if (existingCategoryName !== null) {
          return new Error(`Category with name: ${name} already exists`);
        }
        const category = await ctx.prisma.category.update({
          where: {
            id,
          },
          data: {
            name,
            picture,
          },
        });
        return category;
      } catch (error) {
        return new Error(`Cannot update the category with name: ${name}`);
      }
    }),
  deleteCategoryById: adminProcedure
    .input(z.object({ categoryId: z.string().cuid() }))
    .mutation(async ({ input: { categoryId: id }, ctx }) => {
      try {
        const existingCategory = await ctx.prisma.category.findUnique({
          where: {
            id,
          },
        });
        if (existingCategory === null) {
          return new Error("Category does not exist");
        }
        const category = await ctx.prisma.category.delete({
          where: {
            id,
          },
        });
        return category;
      } catch (error) {
        return new Error("Cannot delete the category");
      }
    }),
  getBrandsByCategoryId: publicProcedure
    .input(functionalityOptions.extend({ categoryId: z.string().cuid() }))
    .query(
      async ({
        input: { categoryId: id, search, sortBy, page, limit, sortOrder },
        ctx,
      }) => {
        try {
          const brands = await ctx.prisma.brand.findMany({
            where: {
              models: {
                some: {
                  categories: {
                    some: {
                      id,
                    },
                  },
                },
              },
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
          });
          return brands;
        } catch (error) {
          console.error(error);
          return new Error("Failed to fetch brands");
        }
      }
    ),
  getModelsByCategoryId: publicProcedure
    .input(functionalityOptions.extend({ categoryId: z.string().cuid() }))
    .query(
      async ({
        input: { categoryId: id, limit, page, search, sortBy, sortOrder },
        ctx,
      }) => {
        try {
          const models = await ctx.prisma.model.findMany({
            where: {
              categories: {
                some: {
                  id,
                },
              },
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
          });
          return models;
        } catch (error) {
          console.error(error);
          return new Error("Failed to fetch models");
        }
      }
    ),
  getProductsByCategoryId: publicProcedure
    .input(functionalityOptions.extend({ categoryId: z.string().cuid() }))
    .query(
      async ({
        input: { categoryId: id, limit, page, search, sortBy, sortOrder },
        ctx,
      }) => {
        try {
          const products = await ctx.prisma.product.findMany({
            where: {
              model: {
                categories: {
                  some: {
                    id,
                  },
                },
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    brand: {
                      name: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  },
                ],
              },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [
              {
                model: {
                  name: sortBy === "name" ? sortOrder : undefined,
                },
              },
              {
                createdAt: sortBy === "createdAt" ? sortOrder : undefined,
              },
            ],
            include: {
              buyer: true,
              seller: true,
              model: true,
              room: true,
            },
          });
          return products;
        } catch (error) {
          console.error(error);
          return new Error("Failed to fetch products");
        }
      }
    ),
});
