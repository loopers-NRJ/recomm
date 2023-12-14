import slugify from "@/lib/slugify";
import { z } from "zod";

import { functionalityOptions, idSchema } from "@/utils/validation";

import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";
import { AccessType } from "@prisma/client";

export const brandRouter = createTRPCRouter({
  getBrands: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: idSchema.optional(),
      })
    )
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, categoryId, cursor },
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
  // getAllSubBrandsByCategoryId: publicProcedure
  //   .input(
  //     functionalityOptions.extend({
  //       categoryId: idSchema.optional(),
  //     })
  //   )
  //   .query(
  //     async ({
  //       input: { limit, search, sortBy, sortOrder, categoryId, cursor },
  //       ctx: { prisma, isAdminPage },
  //     }) => {
  //       const fetchRecursiveBrandsByCateegoryId = (categoryId: string | undefined) => {
  //         const brands = await prisma.brand.findMany({
  //           where: {
  //             name: {
  //               contains: search,
  //             },
  //             models: categoryId
  //               ? {
  //                   some: {
  //                     categories: {
  //                       some: {
  //                         id: categoryId,
  //                         active: isAdminPage ? undefined : true,
  //                       },
  //                     },
  //                   },
  //                 }
  //               : undefined,
  //             active: isAdminPage ? undefined : true,
  //           },
  //           take: limit,
  //           skip: cursor ? 1 : undefined,
  //           cursor: cursor
  //             ? {
  //                 id: cursor,
  //               }
  //             : undefined,
  //           orderBy: [
  //             {
  //               [sortBy]: sortOrder,
  //             },
  //           ],
  //           include: {
  //             image: true,
  //             models: {
  //               include: {
  //                 categories: {
  //                   where: {
  //                     id: categoryId,
  //                     active: isAdminPage ? undefined : true,
  //                   }
  //                 }
  //               }
  //             }
  //           },
  //         });
  //         if (categoryId === undefined) {
  //           return brands;
  //         }
  //         // const subBrands = await Promise.all(
  //         //   brands.map((brand) => fetchRecursiveBrandsByCateegoryId(brand.id))
  //         // );
  //       }
  //       const brands =

  //       return {
  //         brands,
  //         nextCursor: brands[limit - 1]?.id,
  //       };
  //     }
  //   ),
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
      })
    )
    .mutation(async ({ input: { name }, ctx: { prisma } }) => {
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
