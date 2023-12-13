import slugify from "@/lib/slugify";
import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import { modelPayload, singleModelPayload } from "@/types/prisma";
import {
  functionalityOptions,
  idSchema,
  imageInputs,
  modelSchema,
} from "@/utils/validation";

import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";
import { AccessType } from "@prisma/client";

export const modelRouter = createTRPCRouter({
  getModels: publicProcedure
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
        ctx: { prisma, isAdminPage },
      }) => {
        const models = await prisma.model.findMany({
          where: {
            categories: {
              some: {
                id: categoryId,
                active: isAdminPage ? undefined : true,
              },
            },
            active: isAdminPage ? undefined : true,
            brandId,
            brand: {
              active: isAdminPage ? undefined : true,
            },
            name: {
              contains: search,
            },
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
          include: modelPayload.include,
        });
        return {
          models,
          nextCursor: models[limit - 1]?.id,
        };
      }
    ),
  getModelById: publicProcedure
    .input(z.object({ modelId: idSchema.nullish() }))
    .query(async ({ input: { modelId: id }, ctx: { prisma } }) => {
      if (!id) {
        return null;
      }
      const model = await prisma.model.findUnique({
        where: {
          id,
        },
        include: singleModelPayload.include,
      });
      if (model === null) {
        throw new Error("Model not found");
      }
      return model;
    }),

  createModel: getProcedure(AccessType.createModel)
    .input(modelSchema)
    .mutation(
      ({
        input: {
          name,
          brandId,
          categoryId,
          image,
          multipleChoiceQuestions,
          atomicQuestions,
        },
        ctx: { prisma },
      }) => {
        return prisma.$transaction(async (prisma) => {
          const existingModel = await prisma.model.findFirst({
            where: {
              name,
            },
          });
          if (existingModel !== null) {
            throw new Error(`Model ${name} already exists`);
          }

          const model = await prisma.model.create({
            data: {
              name,
              slug: slugify(name),
              categories: {
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
              atomicQuestions: {
                createMany: {
                  data: atomicQuestions,
                },
              },
            },
            include: modelPayload.include,
          });

          for (const multipleChoiceQuestion of multipleChoiceQuestions) {
            await prisma.multipleChoiceQuestion.create({
              data: {
                questionContent: multipleChoiceQuestion.questionContent,
                model: {
                  connect: {
                    id: model.id,
                  },
                },
                type: multipleChoiceQuestion.type,
                choices: {
                  createMany: {
                    data: multipleChoiceQuestion.choices.map((value) => ({
                      value,
                      modelId: model.id,
                    })),
                  },
                },
              },
            });
          }

          return model;
        });
      }
    ),
  updateModelById: getProcedure(AccessType.updateModel)
    .input(
      z.union([
        // TODO: enable updating options and questions
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255),
          categoryId: idSchema.optional(),
          image: imageInputs.optional(),
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          categoryId: idSchema,
          image: imageInputs.optional(),
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          categoryId: idSchema.optional(),
          image: imageInputs,
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          categoryId: idSchema.optional(),
          image: imageInputs.optional(),
          active: z.boolean(),
        }),
      ])
    )
    .mutation(
      async ({
        input: { id, name: newName, categoryId, image: newImage, active },
        ctx: { prisma },
      }) => {
        // check whether the model exists
        const existingModel = await prisma.model.findUnique({
          where: {
            id,
          },
          select: {
            image: true,
          },
        });
        if (existingModel === null) {
          throw new Error("Model not found");
        }
        // check whether the new name is unique
        if (newName !== undefined) {
          const existingModel = await prisma.model.findFirst({
            where: {
              name: newName,
            },
          });
          if (existingModel !== null) {
            throw new Error(`Model ${newName} already exists`);
          }
        }
        // update the model
        const model = await prisma.model.update({
          where: {
            id,
          },
          data: {
            name: newName,
            slug: newName ? slugify(newName) : undefined,
            categories:
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
            active,
          },
          include: singleModelPayload.include,
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
      }
    ),
  deleteModelById: getProcedure(AccessType.deleteModel)
    .input(z.object({ modelId: idSchema }))
    .mutation(async ({ input: { modelId: id }, ctx: { prisma } }) => {
      const existingModel = await prisma.model.findUnique({
        where: {
          id,
        },
        select: {
          image: true,
        },
      });
      if (existingModel === null) {
        throw new Error("Model not found");
      }
      const model = await prisma.model.delete({
        where: {
          id,
        },
      });
      if (existingModel.image !== null) {
        // using void to not wait for the promise to resolve
        void prisma.image
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
    }),
});
