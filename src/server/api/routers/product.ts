import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import {
  idSchema,
  productSchema,
  validateMultipleChoiceQuestionInput,
  validateAtomicQuestionAnswers,
} from "@/utils/validation";
import {
  AccessType,
  MultipleChoiceQuestionType,
  WishStatus,
} from "@prisma/client";

import {
  createTRPCRouter,
  getProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { productsPayload, singleProductPayload, states } from "@/types/prisma";
import slugify from "@/lib/slugify";
import {
  DefaultLimit,
  DefaultSortBy,
  DefaultSortOrder,
  MaxLimit,
} from "@/utils/constants";

export const productRouter = createTRPCRouter({
  getProducts: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(MaxLimit).default(DefaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(DefaultSortOrder),
        sortBy: z
          .enum([
            "name",
            "createdAt",
            "updatedAt",
            "price",
            "active",
            "sellerName",
          ])
          .default(DefaultSortBy),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        modelId: idSchema.optional(),
        state: z.enum(states).optional(),
      })
    )
    .query(
      async ({
        input: {
          limit,
          search,
          sortBy,
          sortOrder,
          categoryId,
          brandId,
          modelId,
          cursor,
          state,
        },
        ctx: { prisma, isAdminPage },
      }) => {
        const products = await prisma.product.findMany({
          where: {
            modelId,
            model: {
              active: isAdminPage ? undefined : true,
              category: {
                id: categoryId,
                active: isAdminPage ? undefined : true,
              },
              brandId,
              brand: {
                active: isAdminPage ? undefined : true,
              },
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  category: {
                    name: {
                      contains: search,
                    },
                  },
                },
                {
                  brand: {
                    name: {
                      contains: search,
                    },
                  },
                },
              ],
              createdState: state,
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
            sortBy === "name"
              ? {
                  model: {
                    name: sortOrder,
                  },
                }
              : sortBy === "sellerName"
              ? {
                  seller: {
                    name: sortOrder,
                  },
                }
              : {
                  [sortBy]: sortOrder,
                },
          ],
          include: productsPayload.include,
        });
        return {
          products,
          nextCursor: products[limit - 1]?.id,
        };
      }
    ),
  getProductById: publicProcedure
    .input(z.object({ productId: idSchema }))
    .query(async ({ input: { productId: id }, ctx: { prisma, session } }) => {
      const product = await prisma.product.findUnique({
        where: {
          id,
        },
        include: singleProductPayload.include,
      });
      type ProductWithIsFavorite = typeof product & { isFavorite?: true };
      if (session?.user !== undefined) {
        const favorited = await prisma.product.findUnique({
          where: {
            id,
            favoritedUsers: {
              some: {
                id: session.user.id,
              },
            },
          },
        });

        if (favorited !== null) {
          (product as ProductWithIsFavorite).isFavorite = true;
        }
      }
      return product as ProductWithIsFavorite;
    }),
  getProductBySlug: publicProcedure
    .input(z.object({ productSlug: z.string() }))
    .query(async ({ input: { productSlug }, ctx: { prisma, session } }) => {
      const product = await prisma.product.findUnique({
        where: {
          slug: productSlug,
        },
        include: singleProductPayload.include,
      });
      type ProductWithIsFavorite = typeof product & { isFavorite?: true };
      if (session?.user !== undefined) {
        const favorited = await prisma.product.findUnique({
          where: {
            slug: productSlug,
            favoritedUsers: {
              some: {
                id: session.user.id,
              },
            },
          },
        });

        if (favorited !== null) {
          (product as ProductWithIsFavorite).isFavorite = true;
        }
      }
      return product as ProductWithIsFavorite;
    }),
  // createProduct: getProcedure(AccessType.subscriber)
  createProduct: protectedProcedure
    .input(productSchema)
    .mutation(
      async ({
        input: {
          title,
          price,
          description,
          images,
          modelId,
          closedAt,
          multipleChoiceAnswers: providedChoices,
          atomicAnswers: providedAnswers,
        },
        ctx: { prisma, session },
      }) => {
        if (closedAt < new Date()) {
          throw new Error("Closed at date must be in the future");
        }
        const user = session.user;
        const model = await prisma.model.findUnique({
          where: {
            id: modelId,
          },
          include: {
            multipleChoiceQuestions: {
              include: {
                choices: true,
              },
            },
            category: true,
            atomicQuestions: true,
          },
        });
        if (model === null) {
          throw new Error("Model does not exist");
        }

        const isValidValues = validateMultipleChoiceQuestionInput(
          model.multipleChoiceQuestions,
          providedChoices
        );
        if (isValidValues !== true) {
          throw new Error("Invalid option");
        }

        const choiceValueIds: string[] = [];
        providedChoices.forEach((choice) =>
          choice.type === MultipleChoiceQuestionType.Checkbox
            ? choiceValueIds.push(...choice.valueIds)
            : choice.valueId && choiceValueIds.push(choice.valueId)
        );

        const isValidAnswers = validateAtomicQuestionAnswers(
          model.atomicQuestions,
          providedAnswers
        );

        if (isValidAnswers !== true) {
          throw new Error("Invalid answers");
        }

        const product = await prisma.product.create({
          data: {
            title,
            slug: slugify(title),
            price,
            description,
            images: {
              createMany: {
                data: images,
              },
            },
            seller: {
              connect: {
                id: user.id,
              },
            },
            model: {
              connect: {
                id: modelId,
              },
            },
            room: {
              create: {
                closedAt,
              },
            },
            selectedChoices: {
              connect: choiceValueIds.map((id) => ({ id })),
            },
            answers: {
              createMany: {
                data: providedAnswers.map((answer) => ({
                  answerContent:
                    answer.answerContent instanceof Date
                      ? answer.answerContent.getTime().toString()
                      : `${answer.answerContent}`,
                  questionId: answer.questionId,
                  modelId,
                })),
              },
            },
          },
          include: singleProductPayload.include,
        });

        const updateWishes = async () => {
          // Updating all the wishes with the categoryId to available
          await prisma.wish.updateMany({
            where: {
              brandId: model.brandId,
              status: WishStatus.pending,
              lowerBound: {
                lte: price,
              },
              upperBound: {
                gte: price,
              },
            },
            data: {
              status: WishStatus.available,
            },
          });
          // Updating all the wishes with the brandId to available
          await prisma.wish.updateMany({
            where: {
              categoryId: model.categoryId,
              status: WishStatus.pending,
              lowerBound: {
                lte: price,
              },
              upperBound: {
                gte: price,
              },
            },
            data: {
              status: WishStatus.available,
            },
          });

          // Updating all the wishes with the modelId to available
          await prisma.wish.updateMany({
            where: {
              modelId,
              status: WishStatus.pending,
              lowerBound: {
                lte: price,
              },
              upperBound: {
                gte: price,
              },
            },
            data: {
              status: WishStatus.available,
            },
          });
        };

        void updateWishes().catch((error) => {
          console.error({
            procedure: "createProduct",
            message: "cannot update wishes",
            error,
          });
        });

        return product;
      }
    ),

  deleteProductById: getProcedure([
    AccessType.subscriber,
    AccessType.deleteProduct,
  ])
    .input(z.object({ productId: idSchema }))
    .mutation(
      async ({ input: { productId: id }, ctx: { prisma, session } }) => {
        const user = session.user;
        const existingProduct = await prisma.product.findUnique({
          where: {
            id,
          },
          include: singleProductPayload.include,
        });
        if (existingProduct === null) {
          throw new Error("Product does not exist");
        }
        if (existingProduct.sellerId !== user.id) {
          throw new Error("You are not the seller of this product");
        }
        if (existingProduct.buyerId !== null) {
          throw new Error("Product is already sold");
        }
        if (existingProduct.room.bids.length > 0) {
          throw new Error("Cannot delete product with bids");
        }
        const product = await prisma.product.delete({
          where: {
            id,
          },
        });

        void prisma.room
          .delete({
            where: {
              id: existingProduct.roomId,
            },
          })
          .catch((error) => {
            console.error({
              procedure: "deleteProductById",
              message: "cannot delete room",
              error,
            });
          });

        existingProduct.images.forEach((image) => {
          // using void to not wait for the promise to resolve
          void deleteImage(image.publicId)
            .then((error) => {
              if (error instanceof Error) {
                console.error({
                  procedure: "deleteProductById",
                  message: `cannot delete image in cloudinary with publicId ${image.publicId}`,
                  error,
                });
              }
            })
            .catch((error) => {
              console.error({
                procedure: "deleteProductById",
                message: "cannot delete images in cloudinary",
                error,
              });
            });
        });

        return product;
      }
    ),
  addProductToFavorites: protectedProcedure
    .input(z.object({ productId: idSchema }))
    .mutation(
      async ({ input: { productId: id }, ctx: { prisma, session } }) => {
        const user = session.user;

        const productInFavorites = await prisma.product.findUnique({
          where: {
            id,
            favoritedUsers: {
              some: {
                id: user.id,
              },
            },
          },
        });
        if (productInFavorites !== null) {
          throw new Error("Product is already in favorites");
        }
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            favoriteProducts: {
              connect: {
                id,
              },
            },
          },
        });
      }
    ),
  removeProductFromFavorites: protectedProcedure
    .input(z.object({ productId: idSchema }))
    .mutation(
      async ({ input: { productId: id }, ctx: { prisma, session } }) => {
        const user = session.user;
        const productInFavorites = await prisma.product.findUnique({
          where: {
            id,
            favoritedUsers: {
              some: {
                id: user.id,
              },
            },
          },
        });
        if (productInFavorites === null) {
          throw new Error("Product is not in favorites");
        }
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            favoriteProducts: {
              disconnect: {
                id,
              },
            },
          },
        });
      }
    ),
});
