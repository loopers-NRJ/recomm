import slugify from "slugify";
import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import {
  functionalityOptions,
  idSchema,
  imageInputs,
} from "@/utils/validation";

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
        ctx: { prisma, isAdmin },
      }) => {
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
                        active: isAdmin ? undefined : true,
                      },
                    },
                  },
                }
              : undefined,
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
          include: {
            image: true,
          },
        });

        return {
          brands,
          nextCursor: brands[limit - 1]?.id,
          previousCursor: cursor,
        };
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
        include: {
          image: true,
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
        image: imageInputs.optional(),
      })
    )
    .mutation(async ({ input: { name, image }, ctx: { prisma } }) => {
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
          image: image
            ? {
                create: image,
              }
            : undefined,
        },
        include: {
          image: true,
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
          image: imageInputs.optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          image: imageInputs,
        }),
      ])
    )
    .mutation(
      async ({
        input: { id, name: newName, image: newImage },
        ctx: { prisma },
      }) => {
        // checking whether the brand exists
        const existingBrand = await prisma.brand.findUnique({
          where: {
            id,
          },
          select: {
            image: true,
            name: true,
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
            image: {
              create: newImage,
            },
          },
          include: {
            image: true,
          },
        });
        if (newImage !== undefined && existingBrand.image !== null) {
          const error = await deleteImage(existingBrand.image.publicId);
          if (error instanceof Error) {
            console.error({
              procedure: "updateBrandById",
              message: "cannot able delete the old image in cloudinary",
              error,
            });
          }
        }
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
        select: {
          image: true,
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

      // using void to not wait for the promise to resolve
      if (existingBrand.image !== null) {
        void prisma.image
          .delete({
            where: {
              id: existingBrand.image.id,
            },
          })
          .catch((error) => {
            console.error({
              procedure: "deleteBrandById",
              message: "cannot able delete the old image in database",
              error,
            });
          });

        // using void to not wait for the promise to resolve
        void deleteImage(existingBrand.image.publicId)
          .then((error) => {
            if (error instanceof Error) {
              console.error({
                procedure: "deleteBrandById",
                error,
              });
            }
          })
          .catch((error) => {
            console.error({
              procedure: "deleteBrandById",
              error,
            });
          });
      }
      return brand;
    }),
});
