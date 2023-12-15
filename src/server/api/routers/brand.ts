import slugify from "@/lib/slugify";
import { z } from "zod";

import { idSchema } from "@/utils/validation";

import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";
import { AccessType } from "@prisma/client";
import {
  DefaultLimit,
  DefaultSortBy,
  DefaultSortOrder,
  MaxLimit,
} from "@/utils/constants";
import { BrandPayload, BrandPayloadIncluded, states } from "@/types/prisma";

export const brandRouter = createTRPCRouter({
  getBrands: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(MaxLimit).default(DefaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(DefaultSortOrder),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt", "active"])
          .default(DefaultSortBy),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        state: z.enum(states).optional(),
      })
    )
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, categoryId, cursor, state },
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
            createdState: state,
          },
          take: limit,
          skip: cursor ? 1 : undefined,
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
        });

        return {
          brands,
          nextCursor: brands[limit - 1]?.id,
        };
      }
    ),
  getAllSubBrandsByCategoryId: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        sortOrder: z.enum(["asc", "desc"]).default(DefaultSortOrder),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt", "active"])
          .default(DefaultSortBy),
        categoryId: idSchema,
      })
    )
    .query(
      async ({
        input: { search, sortBy, sortOrder, categoryId },
        ctx: { prisma, isAdminPage },
      }) => {
        const fetchRecursiveBrandsByCategoryId = async (categoryId: string) => {
          const subCategories = await prisma.category.findMany({
            where: {
              parentCategoryId: categoryId,
            },
            select: {
              id: true,
            },
          });

          if (subCategories.length !== 0) {
            // this is not the leaf category
            const subBrands: BrandPayloadIncluded[] = (
              await Promise.all(
                subCategories.map((category) =>
                  fetchRecursiveBrandsByCategoryId(category.id)
                )
              )
            ).flat();
            return subBrands;
          }

          // this is the leaf category
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
            },
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            include: BrandPayload.include,
          });
          return brands;
        };

        const brands = await fetchRecursiveBrandsByCategoryId(categoryId);

        return brands;
      }
    ),
  getBrandById: publicProcedure
    .input(z.object({ brandId: idSchema.nullish() }))
    .query(async ({ input: { brandId: id }, ctx: { prisma } }) => {
      if (!id) {
        return null;
      }
      const brand = await prisma.brand.findUnique({
        where: {
          id,
        },
      });
      if (brand === null) {
        throw new Error("Brand not found");
      }
      return brand;
    }),

  createBrand: getProcedure(AccessType.createBrand)
    .input(
      z.object({
        name: z.string(),
        state: z.enum(states),
      })
    )
    .mutation(async ({ input: { name, state }, ctx: { prisma, session } }) => {
      // checking whether the brand exists
      const existingBrand = await prisma.brand.findUnique({
        where: {
          name,
        },
      });
      if (existingBrand !== null) {
        throw new Error(`Brand ${name} already exists`);
      }
      // creating the brand
      const brand = await prisma.brand.create({
        data: {
          name,
          slug: slugify(name),
          createdState: state,
          createdBy: {
            connect: {
              id: session.user.id,
            },
          },
        },
      });
      return brand;
    }),
  updateBrandById: getProcedure(AccessType.updateBrand)
    .input(
      z.union([
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255),
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          active: z.boolean(),
        }),
      ])
    )
    .mutation(
      async ({ input: { id, name: newName, active }, ctx: { prisma } }) => {
        // checking whether the brand exists
        const existingBrand = await prisma.brand.findUnique({
          where: {
            id,
          },
        });
        if (existingBrand === null) {
          throw new Error("Brand not found");
        }
        // checking whether the new brand name already exists
        if (newName !== undefined && newName !== existingBrand.name) {
          const existingBrand = await prisma.brand.findFirst({
            where: {
              name: {
                equals: newName,
              },
            },
            select: {
              id: true,
            },
          });
          if (existingBrand !== null) {
            throw new Error(`Brand ${newName} already exists`);
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
          },
        });

        return brand;
      }
    ),
  deleteBrandById: getProcedure(AccessType.deleteBrand)
    .input(z.object({ brandId: idSchema }))
    .mutation(async ({ input: { brandId: id }, ctx: { prisma } }) => {
      const existingBrand = await prisma.brand.findUnique({
        where: {
          id,
        },
      });
      if (existingBrand === null) {
        throw new Error("Brand not found");
      }
      const brand = await prisma.brand.delete({
        where: {
          id,
        },
      });

      return brand;
    }),
});
