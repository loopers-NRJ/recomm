import slugify from "slugify";
import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import {
  functionalityOptions,
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
import { productsPayload, singleProductPayload } from "@/types/prisma";

export const productRouter = createTRPCRouter({
  getProducts: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        modelId: idSchema.optional(),
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
        },
        ctx: { prisma, isAdmin },
      }) => {
        const products = await prisma.product.findMany({
          where: {
            modelId,
            model: {
              active: isAdmin ? undefined : true,
              categories: {
                some: {
                  id: categoryId,
                  active: isAdmin ? undefined : true,
                },
              },
              brandId,
              brand: {
                active: isAdmin ? undefined : true,
              },
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  categories: {
                    some: {
                      name: {
                        contains: search,
                      },
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
              model: {
                name: sortBy === "name" ? sortOrder : undefined,
              },
            },
            {
              createdAt: sortBy === "createdAt" ? sortOrder : undefined,
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
            categories: true,
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
            : choiceValueIds.push(choice.valueId)
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
            slug: slugify(title) + "-" + Date.now(),
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
            choices: {
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
              categoryId: {
                in: model.categories.map((category) => category.id),
              },
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

  // updateProductById: protectedProcedure
  //   .input(
  //     z.union([
  //       z.object({
  //         productId: id,
  //         price: z.number().int().gt(0),
  //         description: z.string().optional(),
  //         // images: z.array(imageInputs).optional(),
  //       }),
  //       z.object({
  //         productId: id,
  //         price: z.number().int().gt(0).optional(),
  //         description: z.string(),
  //         // images: z.array(imageInputs).optional(),
  //       }),
  //       z.object({
  //         productId: id,
  //         price: z.number().int().gt(0).optional(),
  //         description: z.string().optional(),
  //         // images: z.array(imageInputs),
  //       }),
  //     ])
  //   )
  //   .mutation(async ({ input: { productId: id, description, price }, ctx }) => {
  //     try {
  //       const user = session.user;
  //       const existingProduct = await prisma.product.findUnique({
  //         where: {
  //           id,
  //         },
  //       });
  //       if (existingProduct === null) {
  //         throw new Error("Product does not exist");
  //       }
  //       if (existingProduct.sellerId !== user.id) {
  //         throw new Error("You are not the seller of this product");
  //       }
  //       const product = await prisma.product.update({
  //         where: {
  //           id,
  //         },
  //         data: {
  //           description,
  //           price,
  //         },
  //         include: {
  //           buyer: true,
  //           seller: true,
  //           model: true,
  //           room: true,
  //         },
  //       });
  //       return product;
  //     } catch (error) {
  //       console.error({
  //         procedure: "updateProductById",
  //         error,
  //       });

  //       throw new Error("Something went wrong!");
  //     }
  //   }),
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
        // const existingProduct = await prisma.product.findUnique({
        //   where: {
        //     id,
        //   },
        // });
        // if (existingProduct === null) {
        //   throw new Error("Product does not exist");
        // }
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
