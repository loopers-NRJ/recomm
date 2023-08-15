import { functionalityOptions } from "@/utils/schema";
import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";

export const modelRouter = createTRPCRouter({
  getModels: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { limit, page, search, sortBy, sortOrder }, ctx }) => {
        try {
          const models = await ctx.prisma.model.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: {
              [sortBy]: sortOrder,
            },
          });
          return models;
        } catch (error) {
          return new Error("Error fetching models");
        }
      }
    ),
  getModelById: publicProcedure
    .input(z.string().cuid())
    .query(async ({ input: id, ctx }) => {
      try {
        const model = await ctx.prisma.model.findUnique({
          where: {
            id,
          },
        });
        if (model === null) {
          return new Error("Model not found");
        }
        return model;
      } catch (error) {
        return new Error("Error fetching model");
      }
    }),
  createModelById: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        brandId: z.string().cuid(),
        categoryIds: z.array(z.string().cuid()),
      })
    )
    .mutation(async ({ input: { name, brandId, categoryIds }, ctx }) => {
      try {
        const existingModel = await ctx.prisma.model.findFirst({
          where: {
            name,
          },
        });
        if (existingModel !== null) {
          return new Error(`Model ${name} already exists`);
        }
        const model = await ctx.prisma.model.create({
          data: {
            name,
            brandId,
            categories: {
              connect: categoryIds.map((id) => ({ id })),
            },
          },
        });
        return model;
      } catch (error) {
        return new Error("Error creating model");
      }
    }),
  updateModelById: adminProcedure
    .input(
      z.union([
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255),
          categoryIds: z.array(z.string().cuid()).optional(),
        }),
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255).optional(),
          categoryIds: z.array(z.string().cuid()),
        }),
      ])
    )
    .mutation(async ({ input: { id, name, categoryIds }, ctx }) => {
      try {
        const existingModel = await ctx.prisma.model.findUnique({
          where: {
            id,
          },
        });
        if (existingModel === null) {
          return new Error("Model not found");
        }
        if (name !== undefined) {
          const existingModel = await ctx.prisma.model.findFirst({
            where: {
              name,
            },
          });
          if (existingModel !== null) {
            return new Error(`Model ${name} already exists`);
          }
        }
        if (categoryIds !== undefined) {
          const existingCategories = await ctx.prisma.category.findMany({
            where: {
              id: {
                in: categoryIds,
              },
            },
          });
          if (existingCategories.length !== categoryIds.length) {
            return new Error("Invalid category");
          }
        }
        const model = await ctx.prisma.model.update({
          where: {
            id,
          },
          data: {
            name,
            categories: {
              set: categoryIds?.map((id) => ({ id })),
            },
          },
        });
        return model;
      } catch (error) {
        return new Error("Error updating model");
      }
    }),
  deleteModelById: adminProcedure
    .input(z.string().cuid())
    .mutation(async ({ input: id, ctx }) => {
      try {
        const existingModel = await ctx.prisma.model.findUnique({
          where: {
            id,
          },
        });
        if (existingModel === null) {
          return new Error("Model not found");
        }
        const model = await ctx.prisma.model.delete({
          where: {
            id,
          },
        });
        return model;
      } catch (error) {
        return new Error("Error deleting model");
      }
    }),
  getProductsByModelId: publicProcedure
    .input(
      functionalityOptions.extend({
        modelId: z.string().cuid(),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, modelId: id },
        ctx,
      }) => {
        try {
          const products = await ctx.prisma.product.findMany({
            where: {
              modelId: id,
              model: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: {
              model: {
                name: sortBy === "name" ? sortOrder : undefined,
              },
              createdAt: sortBy === "createdAt" ? sortOrder : undefined,
            },
          });
          return products;
        } catch (error) {
          return new Error("Error fetching products");
        }
      }
    ),
});
