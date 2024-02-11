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

import {
  defaultLimit,
  defaultSortBy,
  defaultSortOrder,
  maxLimit,
} from "@/utils/constants";
import { AccessType } from "@prisma/client";
import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";

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
        return "Model not found";
      }
      return model;
    }),

  create: getProcedure(AccessType.createModel)
    .input(modelSchema)
    .mutation(
      async ({
        input: {
          name,
          brandId,
          categoryId,
          multipleChoiceQuestions,
          atomicQuestions,
          state,
        },
        ctx: { prisma, session, logger },
      }) => {
        const existingModel = await prisma.model.findFirst({
          where: {
            name,
            createdState: state,
          },
        });
        if (existingModel !== null) {
          return "Model already exists";
        }
        return prisma.$transaction(async (prisma) => {
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

          await logger.info(
            `'${session.user.name}' created a model named '${model.name}'`,
          );

          return model;
        });
      },
    ),
  update: getProcedure(AccessType.updateModel)
    .input(
      z.union([
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
        ctx: { prisma, session, logger },
      }) => {
        // check whether the model exists
        const existingModel = await prisma.model.findUnique({
          where: {
            id,
          },
        });
        if (existingModel === null) {
          return "Model not found";
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
            return "Model already exists";
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
            updatedBy: {
              connect: {
                id: session.user.id,
              },
            },
          },
          include: singleModelPayload.include,
        });

        if (newName) {
          await logger.info(
            `'${session.user.name}' updated a model's name from '${existingModel.name}' to '${model.name}'`,
          );
        }
        if (categoryId) {
          await logger.info(
            `'${session.user.name}' updated a model's name from '${existingModel.categoryId}' to '${model.categoryId}'`,
          );
        }
        if (brandId) {
          await logger.info(
            `'${session.user.name}' updated a model's name from '${existingModel.brandId}' to '${model.brandId}'`,
          );
        }
        if (active) {
          await logger.info(
            `'${session.user.name}' updated a model's name from '${existingModel.active}' to '${model.active}'`,
          );
        }
        if (createdState) {
          await logger.info(
            `'${session.user.name}' updated a model's name from '${existingModel.createdState}' to '${model.createdState}'`,
          );
        }

        return model;
      },
    ),
  delete: getProcedure(AccessType.deleteModel)
    .input(z.object({ modelId: idSchema }))
    .mutation(
      async ({ input: { modelId: id }, ctx: { prisma, session, logger } }) => {
        const existingModel = await prisma.model.findUnique({
          where: {
            id,
          },
        });
        if (existingModel === null) {
          return "Model not found";
        }
        const model = await prisma.model.delete({
          where: {
            id,
          },
        });

        await logger.info(
          `'${session.user.name}' deleted a model named '${existingModel.name}'`,
        );

        return model;
      },
    ),
  addAtomicQuestion: getProcedure(AccessType.updateModel)
    .input(atomicQuestionSchema.extend({ modelId: idSchema }))
    .mutation(async ({ input: data, ctx: { prisma, session, logger } }) => {
      const model = await prisma.model.findUnique({
        where: {
          id: data.modelId,
        },
        select: {
          name: true,
          atomicQuestions: true,
        },
      });
      if (model === null) {
        return "Model not found";
      }
      const existingQuestion = model.atomicQuestions.find(
        (question) => question.questionContent === data.questionContent,
      );
      if (existingQuestion !== undefined) {
        return "Question already exists";
      }
      const question = await prisma.atomicQuestion.create({ data });
      await logger.info(
        `'${session.user.name}' added a atomic Question to a model named '${model.name}'`,
      );

      return question;
    }),
  addMultipleChoiceQuestion: getProcedure(AccessType.updateModel)
    .input(multipleChoiceQuestionSchema.extend({ modelId: idSchema }))
    .mutation(async ({ input: question, ctx: { prisma, session, logger } }) => {
      const model = await prisma.model.findUnique({
        where: {
          id: question.modelId,
        },
        select: {
          multipleChoiceQuestions: true,
          name: true,
        },
      });
      if (model === null) {
        return "Model not found";
      }
      const existingQuestion = model.multipleChoiceQuestions.find(
        (question) => question.questionContent === question.questionContent,
      );
      if (existingQuestion !== undefined) {
        return "Question already exists";
      }
      const result = await prisma.multipleChoiceQuestion.create({
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

      await logger.info(
        `'${session.user.name}' added a multipleChoice Question to a model named '${model.name}'`,
      );

      return result;
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
    .mutation(
      async ({
        input: { questionId, ...data },
        ctx: { prisma, session, logger },
      }) => {
        const existingQuestion = await prisma.atomicQuestion.findUnique({
          where: {
            id: questionId,
          },
          select: { modelId: true },
        });
        if (existingQuestion === null) {
          return "Question not found";
        }
        if (data.questionContent !== undefined) {
          const existingQuestionContent = await prisma.atomicQuestion.findFirst(
            {
              where: {
                modelId: existingQuestion.modelId,
                questionContent: data.questionContent,
                id: {
                  not: questionId,
                },
              },
            },
          );
          if (existingQuestionContent !== null) {
            return "Question already exists";
          }
        }
        const question = await prisma.atomicQuestion.update({
          where: { id: questionId },
          data: {
            ...data,
            updatedBy: {
              connect: {
                id: session.user.id,
              },
            },
          },
        });
        await logger.info(
          `'${session.user.name}' updated a atomic Question of a model named '${question.modelId}'`,
        );

        return question;
      },
    ),
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
    .mutation(
      async ({ input: { questionId, ...data }, ctx: { prisma, session } }) => {
        const existingQuestion = await prisma.multipleChoiceQuestion.findUnique(
          {
            where: {
              id: questionId,
            },
            select: { modelId: true },
          },
        );
        if (existingQuestion === null) {
          return "Question not found";
        }
        if (data.questionContent !== undefined) {
          const existingQuestionContent =
            await prisma.multipleChoiceQuestion.findFirst({
              where: {
                modelId: existingQuestion.modelId,
                questionContent: data.questionContent,
                id: {
                  not: questionId,
                },
              },
            });
          if (existingQuestionContent !== null) {
            return "Question already exists";
          }
        }
        return await prisma.multipleChoiceQuestion.update({
          where: { id: questionId },
          data: {
            ...data,
            updatedBy: {
              connect: {
                id: session.user.id,
              },
            },
          },
          include: { choices: true },
        });
      },
    ),
  deleteAtomicQuestion: getProcedure(AccessType.updateModel)
    .input(
      z.object({
        questionId: idSchema,
      }),
    )
    .mutation(async ({ input: { questionId }, ctx: { prisma } }) => {
      const existingQuestion = await prisma.atomicQuestion.findUnique({
        where: {
          id: questionId,
        },
      });
      if (existingQuestion === null) {
        return "Question not found";
      }
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
      const existingQuestion = await prisma.multipleChoiceQuestion.findUnique({
        where: {
          id: questionId,
        },
      });
      if (existingQuestion === null) {
        return "Question not found";
      }
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
      const existingQuestion = await prisma.multipleChoiceQuestion.findUnique({
        where: {
          id: data.questionId,
        },
        select: { choices: { select: { value: true } } },
      });
      if (existingQuestion === null) {
        return "Question not found";
      }
      const existingChoice = existingQuestion.choices.find(
        (choice) => choice.value === data.value,
      );
      if (existingChoice !== undefined) {
        return "Choice already exists";
      }

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
    .mutation(
      async ({
        input: { choiceId, value },
        ctx: { prisma, session, logger },
      }) => {
        const existingChoice = await prisma.choice.findUnique({
          where: {
            id: choiceId,
          },
          select: { questionId: true },
        });
        if (existingChoice === null) {
          return "Choice not found";
        }
        const existingChoiceValue = await prisma.choice.findFirst({
          where: {
            questionId: existingChoice.questionId,
            value,
            id: {
              not: choiceId,
            },
          },
        });
        if (existingChoiceValue !== null) {
          return "Choice already exists";
        }

        const question = await prisma.choice.update({
          where: { id: choiceId },
          data: { value, updatedBy: { connect: { id: session.user.id } } },
        });

        await logger.info(
          `'${session.user.name}' updated a choice to a model with id=${question.modelId}`,
        );

        return question;
      },
    ),
  deleteChoice: getProcedure(AccessType.updateModel)
    .input(
      z.object({
        choiceId: idSchema,
      }),
    )
    .mutation(
      async ({ input: { choiceId }, ctx: { prisma, session, logger } }) => {
        const existingChoice = await prisma.choice.findUnique({
          where: {
            id: choiceId,
          },
        });
        if (existingChoice === null) {
          return "Choice not found";
        }
        const deleted = await prisma.choice.delete({
          where: { id: choiceId },
        });
        await logger.info(
          `'${session.user.name}' deleted a choice for a model with id=${deleted.modelId}`,
        );
      },
    ),
});
