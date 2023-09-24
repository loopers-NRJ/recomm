import slugify from "slugify";
import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import {
  functionalityOptions,
  idSchema,
  imageInputs,
} from "@/utils/validation";

import {
  adminCreateProcedure,
  adminDeleteProcedure,
  adminUpdateProcedure,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

export const brandRouter = createTRPCRouter({
  getBrands: publicProcedure
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
          const [count, brands] = await prisma.$transaction([
            prisma.brand.count({
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
            }),
            prisma.brand.findMany({
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
              include: {
                image: true,
              },
            }),
          ]);

          return {
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            brands,
          };
        } catch (error) {
          console.error({ procedure: "getBrands", error });

          return new Error("Something went wrong!");
        }
      }
    ),
  getBrandById: publicProcedure
    .input(z.object({ brandId: idSchema.nullish() }))
    .query(async ({ input: { brandId: id }, ctx: { prisma } }) => {
      try {
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
          return new Error("Brand not found");
        }
        return brand;
      } catch (error) {
        console.error({ procedure: "getBrandById", error });
        return new Error("Something went wrong!");
      }
    }),

  createBrand: adminCreateProcedure
    .input(
      z.object({
        name: z.string(),
        image: imageInputs.optional(),
      })
    )
    .mutation(async ({ input: { name, image }, ctx: { prisma } }) => {
      try {
        // checking whether the brand exists
        const existingBrand = await prisma.brand.findUnique({
          where: {
            name,
          },
        });
        if (existingBrand !== null) {
          return new Error(`Brand ${name} already exists`);
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
      } catch (error) {
        console.error({ procedure: "createBrand", error });
        return new Error("Error creating brand");
      }
    }),
  updateBrandById: adminUpdateProcedure
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
        try {
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
            return new Error("Brand not found");
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
              return new Error(`Brand ${newName} already exists`);
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
        } catch (error) {
          console.error({ procedure: "updateBrandById", error });
          return new Error(`Error updating brand with id ${id}`);
        }
      }
    ),
  deleteBrandById: adminDeleteProcedure
    .input(z.object({ brandId: idSchema }))
    .mutation(async ({ input: { brandId: id }, ctx: { prisma } }) => {
      try {
        const existingBrand = await prisma.brand.findUnique({
          where: {
            id,
          },
          select: {
            image: true,
          },
        });
        if (existingBrand === null) {
          return new Error("Brand not found");
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
      } catch (error) {
        console.error("Error deleteBrandById", error);
        return new Error(`cannot delete brand with id: ${id}`);
      }
    }),
});
