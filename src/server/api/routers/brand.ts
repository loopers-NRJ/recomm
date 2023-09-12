import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import { functionalityOptions, imageInputs } from "@/utils/validation";

import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const brandRouter = createTRPCRouter({
  getBrands: publicProcedure
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
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            include: {
              image: true,
            },
          });
          return brands;
        } catch (error) {
          console.error({ procedure: "getBrands", error });

          return new Error("Error fetching brands");
        }
      }
    ),
  getBrandById: publicProcedure
    .input(z.object({ brandId: z.string().cuid() }))
    .query(async ({ input: { brandId: id }, ctx }) => {
      try {
        const brand = await ctx.prisma.brand.findUnique({
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
        return new Error("Error fetching brand");
      }
    }),
  createBrand: adminProcedure
    .input(
      z.object({
        name: z.string(),
        image: imageInputs,
      })
    )
    .mutation(async ({ input: { name, image }, ctx }) => {
      try {
        // checking whether the brand exists
        const existingBrand = await ctx.prisma.brand.findUnique({
          where: {
            name,
          },
        });
        if (existingBrand !== null) {
          return new Error(`Brand ${name} already exists`);
        }
        // creating the brand
        const brand = await ctx.prisma.brand.create({
          data: {
            name,
            image: {
              create: image,
            },
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
  updateBrandById: adminProcedure
    .input(
      z.union([
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255),
          image: imageInputs.optional(),
        }),
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255).optional(),
          image: imageInputs,
        }),
      ])
    )
    .mutation(
      async ({ input: { id, name: newName, image: newImage }, ctx }) => {
        try {
          // checking whether the brand exists
          const existingBrand = await ctx.prisma.brand.findUnique({
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
            const existingBrand = await ctx.prisma.brand.findFirst({
              where: {
                name: {
                  equals: newName,
                  mode: "insensitive",
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
          const brand = await ctx.prisma.brand.update({
            where: {
              id,
            },
            data: {
              name: newName,
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
  deleteBrandById: adminProcedure
    .input(z.object({ brandId: z.string().cuid() }))
    .mutation(async ({ input: { brandId: id }, ctx }) => {
      try {
        const existingBrand = await ctx.prisma.brand.findUnique({
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
        const brand = await ctx.prisma.brand.delete({
          where: {
            id,
          },
        });

        // using void to not wait for the promise to resolve
        void ctx.prisma.brandImage
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

        return brand;
      } catch (error) {
        console.error("Error deleteBrandById", error);
        return new Error(`cannot delete brand with id: ${id}`);
      }
    }),
  getModelsByBrandId: publicProcedure
    .input(
      functionalityOptions.extend({
        brandId: z.string().cuid(),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, brandId: id },
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
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            include: {
              categories: {
                include: {
                  image: true,
                },
              },
              brand: {
                include: {
                  image: true,
                },
              },
              image: true,
            },
          });
          return models;
        } catch (error) {
          console.error({ procedure: "getModelsByBrandId", error });
          return new Error("Error fetching models");
        }
      }
    ),
  getProductsByBrandId: publicProcedure
    .input(
      functionalityOptions.extend({
        brandId: z.string().cuid(),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, brandId: id },
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
            orderBy: [
              {
                model: {
                  name: sortBy === "name" ? sortOrder : undefined,
                },
              },
              { createdAt: sortBy === "createdAt" ? sortOrder : undefined },
            ],
            include: {
              images: true,
              model: {
                include: {
                  image: true,
                  categories: {
                    include: {
                      image: true,
                    },
                  },
                  brand: {
                    include: {
                      image: true,
                    },
                  },
                },
              },
            },
          });
          return products;
        } catch (error) {
          console.error({ procedure: "getProductsByBrandId", error });
          return new Error("Error fetching products");
        }
      }
    ),
});
