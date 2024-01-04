import slugify from "@/lib/slugify";
import { z } from "zod";

import {
  atomicQuestionTypeArray,
  modelsPayload,
  multipleChoiceQuestionTypeArray,
  singleModelPayload,
  states,
} from "@/types/prisma";
import {
  atomicQuestionSchema,
  idSchema,
  modelSchema,
  multipleChoiceQuestionSchema,
} from "@/utils/validation";

import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";
import { AccessType } from "@prisma/client";
import {
  defaultLimit,
  defaultSortBy,
  defaultSortOrder,
  maxLimit,
} from "@/utils/constants";

export const modelRouter = createTRPCRouter({
  all: publicProcedure
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
  byId: publicProcedure
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

  create: getProcedure(AccessType.createModel)
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
  update: getProcedure(AccessType.updateModel)
    .input(
      z.union([
        // TODO: enable updating options and questions
        z.object({
          id: idSchema,
          categoryId: idSchema.optional(),
          brandId: idSchema.optional(),
          active: z.boolean().optional(),
          createdState: z.enum(states).optional(),
          name: z.string().min(1).max(255),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          brandId: idSchema.optional(),
          active: z.boolean().optional(),
          createdState: z.enum(states).optional(),
          categoryId: idSchema,
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          categoryId: idSchema.optional(),
          active: z.boolean().optional(),
          createdState: z.enum(states).optional(),
          brandId: idSchema,
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          categoryId: idSchema.optional(),
          brandId: idSchema.optional(),
          createdState: z.enum(states).optional(),
          active: z.boolean(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          categoryId: idSchema.optional(),
          brandId: idSchema.optional(),
          active: z.boolean().optional(),
          createdState: z.enum(states),
        }),
      ]),
    )
    .mutation(
      async ({
        input: { id, name: newName, categoryId, active, brandId, createdState },
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
            brand: brandId
              ? {
                  connect: {
                    id: brandId,
                  },
                }
              : undefined,
            active,
            createdState: createdState,
          },
          include: singleModelPayload.include,
        });

        return model;
      },
    ),
  delete: getProcedure(AccessType.deleteModel)
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
  addAtomicQuestion: getProcedure(AccessType.updateModel)
    .input(atomicQuestionSchema.extend({ modelId: idSchema }))
    .mutation(async ({ input: data, ctx: { prisma } }) => {
      return prisma.atomicQuestion.create({ data });
    }),
  addMultipleChoiceQuestion: getProcedure(AccessType.updateModel)
    .input(multipleChoiceQuestionSchema.extend({ modelId: idSchema }))
    .mutation(async ({ input: question, ctx: { prisma } }) => {
      return await prisma.multipleChoiceQuestion.create({
        data: {
          questionContent: question.questionContent,
          model: {
            connect: {
              id: question.modelId,
            },
          },
          type: question.type,
          choices: {
            createMany: {
              data: question.choices.map((value) => ({
                value,
                modelId: question.modelId,
              })),
            },
          },
        },
        include: {
          choices: true,
        },
      });
    }),
  updateAtomicQuestion: getProcedure(AccessType.updateModel)
    .input(
      z.union([
        z.object({
          questionId: idSchema,
          required: z.boolean(),
          questionContent: z.string().trim().min(0).optional(),
          type: z.enum(atomicQuestionTypeArray).optional(),
        }),
        z.object({
          questionId: idSchema,
          required: z.boolean().optional(),
          questionContent: z.string().trim().min(0),
          type: z.enum(atomicQuestionTypeArray).optional(),
        }),
        z.object({
          questionId: idSchema,
          required: z.boolean().optional(),
          questionContent: z.string().trim().min(0).optional(),
          type: z.enum(atomicQuestionTypeArray),
        }),
      ]),
    )
    .mutation(async ({ input: { questionId, ...data }, ctx: { prisma } }) => {
      return await prisma.atomicQuestion.update({
        where: { id: questionId },
        data,
      });
    }),
  updateMultipleChoiceQuestion: getProcedure(AccessType.updateModel)
    .input(
      z.union([
        z.object({
          questionId: idSchema,
          required: z.boolean(),
          questionContent: z.string().trim().min(0).optional(),
          type: z.enum(multipleChoiceQuestionTypeArray).optional(),
        }),
        z.object({
          questionId: idSchema,
          required: z.boolean().optional(),
          questionContent: z.string().trim().min(0),
          type: z.enum(multipleChoiceQuestionTypeArray).optional(),
        }),
        z.object({
          questionId: idSchema,
          required: z.boolean().optional(),
          questionContent: z.string().trim().min(0).optional(),
          type: z.enum(multipleChoiceQuestionTypeArray),
        }),
      ]),
    )
    .mutation(async ({ input: { questionId, ...data }, ctx: { prisma } }) => {
      return await prisma.multipleChoiceQuestion.update({
        where: { id: questionId },
        data,
        include: { choices: true },
      });
    }),
  deleteAtomicQuestion: getProcedure(AccessType.updateModel)
    .input(
      z.object({
        questionId: idSchema,
      }),
    )
    .mutation(async ({ input: { questionId }, ctx: { prisma } }) => {
      await prisma.atomicQuestion.delete({
        where: { id: questionId },
      });
    }),
  deleteMultipleChoiceQuestion: getProcedure(AccessType.updateModel)
    .input(
      z.object({
        questionId: idSchema,
      }),
    )
    .mutation(async ({ input: { questionId }, ctx: { prisma } }) => {
      await prisma.multipleChoiceQuestion.delete({
        where: { id: questionId },
      });
    }),
  addChoice: getProcedure(AccessType.updateModel)
    .input(
      z.object({
        value: z.string().trim().min(1),
        modelId: idSchema,
        questionId: idSchema,
      }),
    )
    .mutation(async ({ input: data, ctx: { prisma } }) => {
      const result = await prisma.choice.create({ data });
      return result;
    }),
  updateChoice: getProcedure(AccessType.updateModel)
    .input(
      z.object({
        choiceId: idSchema,
        value: z.string().trim().min(1),
      }),
    )
    .mutation(async ({ input: { choiceId, value }, ctx: { prisma } }) => {
      return await prisma.choice.update({
        where: { id: choiceId },
        data: { value },
      });
    }),
  deleteChoice: getProcedure(AccessType.updateModel)
    .input(
      z.object({
        choiceId: idSchema,
      }),
    )
    .mutation(async ({ input: { choiceId }, ctx: { prisma } }) => {
      await prisma.choice.delete({
        where: { id: choiceId },
      });
    }),
});
