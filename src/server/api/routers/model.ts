import slugify from "slugify";
import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import { functionalityOptions, imageInputs } from "@/utils/validation";

import { adminProcedure, createTRPCRouter, publicProcedure } from "../trpc";

export const modelRouter = createTRPCRouter({
  getModels: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: z.string().cuid().optional(),
        brandId: z.string().cuid().optional(),
      })
    )
    .query(
      async ({
        input: { limit, page, search, sortBy, sortOrder, brandId, categoryId },
        ctx,
      }) => {
        try {
          const models = await ctx.prisma.model.findMany({
            where: {
              categoryId,
              brandId,
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            include: {
              brand: {
                include: {
                  image: true,
                },
              },
              category: {
                include: {
                  image: true,
                },
              },
              image: true,
            },
          });
          return models;
        } catch (error) {
          console.error({
            procedure: "getModels",
            error,
          });
          return new Error("Something went wrong!");
        }
      }
    ),
  getModelById: publicProcedure
    .input(z.object({ modelId: z.string().cuid() }))
    .query(async ({ input: { modelId: id }, ctx }) => {
      try {
        const model = await ctx.prisma.model.findUnique({
          where: {
            id,
          },
          include: {
            brand: {
              include: {
                image: true,
              },
            },
            category: {
              include: {
                image: true,
              },
            },
            image: true,
          },
        });
        if (model === null) {
          return new Error("Model not found");
        }
        return model;
      } catch (error) {
        console.error({
          procedure: "getModelById",
          error,
        });
        return new Error("Something went wrong!");
      }
    }),
  createModel: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        brandId: z.string().cuid(),
        categoryId: z.string().cuid(),
        image: imageInputs.optional(),
      })
    )
    .mutation(async ({ input: { name, brandId, categoryId, image }, ctx }) => {
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
            slug: slugify(name),
            category: {
              connect: {
                id: categoryId,
              },
            },
            brand: {
              connect: {
                id: brandId,
              },
            },
            image: image
              ? {
                  create: image,
                }
              : undefined,
          },
          include: {
            brand: {
              include: {
                image: true,
              },
            },
            category: {
              include: {
                image: true,
              },
            },
            image: true,
          },
        });
        return model;
      } catch (error) {
        console.error({
          procedure: "createModelById",
          error,
        });
        return new Error("Error creating model");
      }
    }),
  updateModelById: adminProcedure
    .input(
      z.union([
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255),
          categoryId: z.string().cuid().optional(),
          image: imageInputs.optional(),
        }),
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255).optional(),
          categoryId: z.string().cuid(),
          image: imageInputs.optional(),
        }),
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255).optional(),
          categoryId: z.string().cuid().optional(),
          image: imageInputs,
        }),
      ])
    )
    .mutation(
      async ({
        input: { id, name: newName, categoryId, image: newImage },
        ctx,
      }) => {
        try {
          // check whether the model exists
          const existingModel = await ctx.prisma.model.findUnique({
            where: {
              id,
            },
            select: {
              image: true,
            },
          });
          if (existingModel === null) {
            return new Error("Model not found");
          }
          // check whether the new name is unique
          if (newName !== undefined) {
            const existingModel = await ctx.prisma.model.findFirst({
              where: {
                name: newName,
              },
            });
            if (existingModel !== null) {
              return new Error(`Model ${newName} already exists`);
            }
          }
          // update the model
          const model = await ctx.prisma.model.update({
            where: {
              id,
            },
            data: {
              name: newName,
              slug: newName ? slugify(newName) : undefined,
              category:
                categoryId !== undefined
                  ? {
                      connect: {
                        id: categoryId,
                      },
                    }
                  : undefined,
              image:
                newImage !== undefined
                  ? {
                      create: newImage,
                    }
                  : undefined,
            },
            include: {
              brand: {
                include: {
                  image: true,
                },
              },
              category: {
                include: {
                  image: true,
                },
              },
              image: true,
            },
          });
          // delete the old image
          if (newImage !== undefined && existingModel.image !== null) {
            const error = await deleteImage(existingModel.image.publicId);
            if (error instanceof Error) {
              console.error({
                procedure: "updateBrandById",
                message: "cannot able delete the old image in cloudinary",
                error,
              });
            }
          }
          return model;
        } catch (error) {
          console.error({
            procedure: "updateModelById",
            error,
          });
          return new Error("Error updating model");
        }
      }
    ),
  deleteModelById: adminProcedure
    .input(z.object({ modelId: z.string().cuid() }))
    .mutation(async ({ input: { modelId: id }, ctx }) => {
      try {
        const existingModel = await ctx.prisma.model.findUnique({
          where: {
            id,
          },
          select: {
            image: true,
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
        if (existingModel.image !== null) {
          // using void to not wait for the promise to resolve
          void ctx.prisma.image
            .delete({
              where: {
                id: existingModel.image.id,
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
          void deleteImage(existingModel.image.publicId)
            .then((error) => {
              if (error instanceof Error) {
                console.error({
                  procedure: "deleteModelById",
                  error,
                });
              }
            })
            .catch((error) => {
              console.error({
                procedure: "deleteModelById",
                error,
              });
            });
        }
        return model;
      } catch (error) {
        console.error({
          procedure: "deleteModelById",
          error,
        });
        return new Error("Error deleting model");
      }
    }),
});
