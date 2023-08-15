import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  adminProcedure,
  publicProcedure,
} from "../trpc";

import { functionalityOptions } from "@/utils/schema";

export const brandRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { limit, page, search, sortBy, sortOrder }, ctx }) => {
        try {
          const brands = await ctx.prisma.brand.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            skip: limit * (page - 1),
            take: limit,
            orderBy: {
              [sortBy]: sortOrder,
            },
          });
        } catch (error) {
          return new Error("Error fetching brands");
        }
      }
    ),
  getById: publicProcedure
    .input(z.string())
    .query(async ({ input: id, ctx }) => {
      try {
        const brand = await ctx.prisma.brand.findUnique({
          where: {
            id,
          },
        });
        if (brand === null) {
          return new Error("Brand not found");
        }
        return brand;
      } catch (error) {
        return new Error("Error fetching brand");
      }
    }),
  create: adminProcedure
    .input(
      z.object({
        name: z.string(),
        picture: z.string().url(),
      })
    )
    .mutation(async ({ input: { name, picture }, ctx }) => {
      try {
        const existingBrand = await ctx.prisma.brand.findUnique({
          where: {
            name,
          },
        });
        if (existingBrand !== null) {
          return new Error(`Brand ${name} already exists`);
        }
        const brand = await ctx.prisma.brand.create({
          data: {
            name,
            picture,
          },
        });
        return brand;
      } catch (error) {
        return new Error("Error creating brand");
      }
    }),
  update: adminProcedure
    .input(
      z.union([
        z.object({
          id: z.string(),
          name: z.string(),
          picture: z.string().url().optional(),
        }),
        z.object({
          id: z.string(),
          name: z.string().optional(),
          picture: z.string().url(),
        }),
      ])
    )
    .mutation(async ({ input: { id, name, picture }, ctx }) => {
      try {
        const existingBrand = await ctx.prisma.brand.findUnique({
          where: {
            id,
          },
        });
        if (existingBrand === null) {
          return new Error("Brand not found");
        }
        const existingBrandName = await ctx.prisma.brand.findUnique({
          where: {
            name,
          },
        });
        if (existingBrandName !== null) {
          return new Error(`Brand ${name} already exists`);
        }
        const brand = await ctx.prisma.brand.update({
          where: {
            id,
          },
          data: {
            name,
            picture,
          },
        });
        return brand;
      } catch (error) {
        return new Error("Error updating brand");
      }
    }),
  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ input: id, ctx }) => {
      try {
        const existingBrand = await ctx.prisma.brand.findUnique({
          where: {
            id,
          },
        });
        if (existingBrand === null) {
          return new Error("Brand not found");
        }
        const brand = await ctx.prisma.brand.delete({
          where: {
            id,
          },
        });
        return brand;
      } catch (error) {
        return new Error("Error deleting brand");
      }
    }),
  getModelsByBrandId: publicProcedure
    .input(
      functionalityOptions.extend({
        id: z.string(),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, id },
        ctx,
      }) => {
        try {
          const models = await ctx.prisma.model.findMany({
            where: {
              brandId: id,
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            skip: limit * (page - 1),
            take: limit,
            orderBy: {
              [sortBy]: sortOrder,
            },
          });
        } catch (error) {
          return new Error("Error fetching models");
        }
      }
    ),
  getProductsByBrandId: publicProcedure
    .input(
      functionalityOptions.extend({
        id: z.string(),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, id },
        ctx,
      }) => {
        try {
          const products = await ctx.prisma.product.findMany({
            where: {
              model: {
                brandId: id,
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
            skip: limit * (page - 1),
            take: limit,
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
