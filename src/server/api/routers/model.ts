import slugify from "@/lib/slugify";
import { z } from "zod";

import { modelsPayload, singleModelPayload, states } from "@/types/prisma";
import { idSchema, modelSchema } from "@/utils/validation";

import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";
import { AccessType } from "@prisma/client";
import {
  defaultLimit,
  defaultSortBy,
  defaultSortOrder,
  maxLimit,
} from "@/utils/constants";

export const modelRouter = createTRPCRouter({
  getModels: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        sortBy: z
          .enum([
            "name",
            "createdAt",
            "updatedAt",
            "brand",
            "category",
            "active",
          ])
          .default(defaultSortBy),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        state: z.enum(states),
      }),
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
          state,
        },
        ctx: { prisma, isAdminPage },
      }) => {
        const models = await prisma.model.findMany({
          where: {
            category: {
              id: categoryId,
              active: isAdminPage ? undefined : true,
            },
            active: isAdminPage ? undefined : true,
            brandId,
            brand: {
              active: isAdminPage ? undefined : true,
            },
            name: {
              contains: search,
            },
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
            sortBy === "brand"
              ? {
                  brand: {
                    name: sortOrder,
                  },
                }
              : sortBy === "category"
                ? {
                    category: {
                      name: sortOrder,
                    },
                  }
                : {
                    [sortBy]: sortOrder,
                  },
          ],
          include: modelsPayload.include,
        });
        return {
          models,
          nextCursor: models[limit - 1]?.id,
        };
      },
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
          multipleChoiceQuestions,
          atomicQuestions,
          state,
        },
        ctx: { prisma, session },
      }) => {
        return prisma.$transaction(async (prisma) => {
          const existingModel = await prisma.model.findFirst({
            where: {
              name,
              createdState: state,
            },
          });
          if (existingModel !== null) {
            throw new Error(`Model ${name} already exists`);
          }

          const model = await prisma.model.create({
            data: {
              name,
              slug: slugify(name),
              createdBy: {
                connect: {
                  id: session.user.id,
                },
              },
              createdState: state,
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
              atomicQuestions: {
                createMany: {
                  data: atomicQuestions,
                },
              },
            },
            include: modelsPayload.include,
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
      },
    ),
  updateModelById: getProcedure(AccessType.updateModel)
    .input(
      z.union([
        // TODO: enable updating options and questions
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255),
          categoryId: idSchema.optional(),
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          categoryId: idSchema,
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          categoryId: idSchema.optional(),
          active: z.boolean(),
        }),
      ]),
    )
    .mutation(
      async ({
        input: { id, name: newName, categoryId, active },
        ctx: { prisma },
      }) => {
        // check whether the model exists
        const existingModel = await prisma.model.findUnique({
          where: {
            id,
          },
          select: {
            name: true,
            createdState: true,
          },
        });
        if (existingModel === null) {
          throw new Error("Model not found");
        }
        // check whether the new name is unique
        if (newName !== undefined && newName !== existingModel.name) {
          const existingName = await prisma.model.findFirst({
            where: {
              name: newName,
              createdState: existingModel.createdState,
            },
          });
          if (existingName !== null) {
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
            category:
              categoryId !== undefined
                ? {
                    connect: {
                      id: categoryId,
                    },
                  }
                : undefined,
            active,
          },
          include: singleModelPayload.include,
        });

        return model;
      },
    ),
  deleteModelById: getProcedure(AccessType.deleteModel)
    .input(z.object({ modelId: idSchema }))
    .mutation(async ({ input: { modelId: id }, ctx: { prisma } }) => {
      const existingModel = await prisma.model.findUnique({
        where: {
          id,
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

      return model;
    }),
});
