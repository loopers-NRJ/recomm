import slugify from "@/lib/slugify";
import { z } from "zod";

import {
  atomicQuestionTypeArray,
  modelsPayload,
  multipleChoiceQuestionTypeArray,
  singleModelPayload,
} from "@/types/prisma";
import {
  atomicQuestionSchema,
  idSchema,
  modelSchema,
  multipleChoiceQuestionSchema,
  priceRangeSchema,
} from "@/utils/validation";

import {
  DEFAULT_LIMIT,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  MAXIMUM_LIMIT,
} from "@/utils/constants";
import { AccessType } from "@prisma/client";
import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";

export const modelRouter = createTRPCRouter({
  allForAdmin: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z
          .number()
          .int()
          .positive()
          .max(MAXIMUM_LIMIT)
          .default(DEFAULT_LIMIT),
        sortOrder: z.enum(["asc", "desc"]).default(DEFAULT_SORT_ORDER),
        sortBy: z
          .enum([
            "name",
            "createdAt",
            "createdBy",
            "updatedAt",
            "updatedBy",
            "brand",
            "category",
            "active",
          ])
          .default(DEFAULT_SORT_BY),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        city: z.string().trim().min(1),
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
          city,
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
            cityValue: city,
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
                : sortBy === "createdBy"
                  ? {
                      createdBy: {
                        name: sortOrder,
                      },
                    }
                  : sortBy === "updatedBy"
                    ? {
                        updatedBy: {
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
  all: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z
          .number()
          .int()
          .positive()
          .max(MAXIMUM_LIMIT)
          .default(DEFAULT_LIMIT),
        sortOrder: z.enum(["asc", "desc"]).default(DEFAULT_SORT_ORDER),
        sortBy: z
          .enum([
            "name",
            "createdAt",
            "createdBy",
            "updatedAt",
            "updatedBy",
            "brand",
            "category",
            "active",
          ])
          .default(DEFAULT_SORT_BY),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        city: z.string().trim().min(1).optional(),
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
          city,
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
            cityValue: city,
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
                : sortBy === "createdBy"
                  ? {
                      createdBy: {
                        name: sortOrder,
                      },
                    }
                  : sortBy === "updatedBy"
                    ? {
                        updatedBy: {
                          name: sortOrder,
                        },
                      }
                    : {
                        [sortBy]: sortOrder,
                      },
          ],
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

  bySlug: publicProcedure
    .input(z.object({ modelSlug: z.string().trim().min(1).max(255) }))
    .query(async ({ input: { modelSlug: slug }, ctx: { prisma } }) => {
      return await prisma.model.findUnique({
        where: {
          slug: slug,
          active: true,
        },
      });
    }),

  create: getProcedure(AccessType.createModel)
    .input(modelSchema)
    .mutation(
      async ({
        input: {
          name,
          priceRange,
          brandId,
          categoryId,
          multipleChoiceQuestions,
          atomicQuestions,
          city,
        },
        ctx: { prisma, session, logger },
      }) => {
        const existingModel = await prisma.model.findFirst({
          where: {
            name,
            cityValue: city,
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
              minimumPrice: priceRange[0],
              maximumPrice: priceRange[1],
              createdBy: {
                connect: {
                  id: session.user.id,
                },
              },
              createdCity: {
                connect: {
                  value: city,
                },
              },
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

          await logger.info({
            message: `'${session.user.name}' created a model named '${model.name}'`,
            city: model.cityValue,
          });

          return model;
        });
      },
    ),
  update: getProcedure(AccessType.updateModel)
    .input(
      z.object({
        id: idSchema,
        priceRange: priceRangeSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        active: z.boolean().optional(),
        city: z.string().trim().min(1).optional(),
        name: z.string().trim().min(1).max(255).optional(),
      }),
    )
    .mutation(
      async ({
        input: {
          id,
          name: newName,
          priceRange,
          categoryId,
          active,
          brandId,
          city,
        },
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
              cityValue: existingModel.cityValue,
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
            minimumPrice: priceRange ? priceRange[0] : undefined,
            maximumPrice: priceRange ? priceRange[1] : undefined,
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
            createdCity: {
              connect: {
                value: city,
              },
            },
            updatedBy: {
              connect: {
                id: session.user.id,
              },
            },
          },
          include: singleModelPayload.include,
        });

        if (newName) {
          await logger.info({
            message: `'${session.user.name}' updated a model's name from '${existingModel.name}' to '${model.name}'`,
            city: model.cityValue,
          });
        }
        if (priceRange) {
          await logger.info({
            message: `'${session.user.name}' updated a model's price range from '${existingModel.minimumPrice}-${existingModel.maximumPrice}' to '${priceRange[0]}-${priceRange[1]}'`,
            city: model.cityValue,
          });
        }
        if (categoryId) {
          await logger.info({
            message: `'${session.user.name}' updated a model's name from '${existingModel.categoryId}' to '${model.categoryId}'`,
            city: model.cityValue,
          });
        }
        if (brandId) {
          await logger.info({
            message: `'${session.user.name}' updated a model's name from '${existingModel.brandId}' to '${model.brandId}'`,
            city: model.cityValue,
          });
        }
        if (active) {
          await logger.info({
            message: `'${session.user.name}' updated a model's name from '${existingModel.active}' to '${model.active}'`,
            city: model.cityValue,
          });
        }
        if (city) {
          await logger.info({
            message: `'${session.user.name}' updated a model's name from '${existingModel.cityValue}' to '${model.cityValue}'`,
            city: model.cityValue,
          });
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

        await logger.info({
          message: `'${session.user.name}' deleted a model named '${existingModel.name}'`,
          city: model.cityValue,
        });

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
          cityValue: true,
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
      const question = await prisma.atomicQuestion.create({
        data,
      });
      await logger.info({
        message: `'${session.user.name}' added a atomic Question to a model named '${model.name}'`,
        city: model.cityValue,
      });

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
          cityValue: true,
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

      await logger.info({
        message: `'${session.user.name}' added a multipleChoice Question to a model named '${model.name}'`,
        city: model.cityValue,
      });

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
          select: { modelId: true, model: { select: { cityValue: true } } },
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
        await logger.info({
          message: `'${session.user.name}' updated a atomic Question of a model named '${question.modelId}'`,
          city: existingQuestion.model.cityValue,
        });

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
          select: {
            questionId: true,
            model: { select: { cityValue: true } },
          },
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

        await logger.info({
          message: `'${session.user.name}' updated a choice to a model with id=${question.modelId}`,
          city: existingChoice.model.cityValue,
        });

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
          select: { model: { select: { cityValue: true } } },
        });
        if (existingChoice === null) {
          return "Choice not found";
        }
        const deleted = await prisma.choice.delete({
          where: { id: choiceId },
        });
        await logger.info({
          message: `'${session.user.name}' deleted a choice for a model with id=${deleted.modelId}`,
          city: existingChoice.model.cityValue,
        });
      },
    ),
});
