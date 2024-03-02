import { z } from "zod";

import {
  idSchema,
  productSchema,
  validateAtomicQuestionAnswers,
  validateMultipleChoiceQuestionInput,
} from "@/utils/validation";
import {
  AccessType,
  MultipleChoiceQuestionType,
  type User,
} from "@prisma/client";

import slugify from "@/lib/slugify";
import { productsPayload, singleProductPayload, states } from "@/types/prisma";
import {
  defaultLimit,
  defaultSortBy,
  defaultSortOrder,
  maxLimit,
} from "@/utils/constants";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { updateWishStatus } from "../updateWishStatus";
import { api } from "@/trpc/server";

export const productRouter = createTRPCRouter({
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
            "price",
            "active",
            "sellerName",
          ])
          .default(defaultSortBy),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        modelId: idSchema.optional(),
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
            isDeleted: isAdminPage ? undefined : false,
            active: isAdminPage ? undefined : true,
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
      },
    ),
  byId: publicProcedure
    .input(z.object({ productId: idSchema }))
    .query(
      async ({
        input: { productId: id },
        ctx: { prisma, session, isAdminPage },
      }) => {
        const product = await prisma.product.findUnique({
          where: {
            id,
            active: isAdminPage ? undefined : true,
          },
          include: singleProductPayload.include,
        });
        type ProductWithIsFavorite = typeof product & { isFavorite?: true };
        if (session?.user !== undefined) {
          const favorite = await prisma.product.findUnique({
            where: {
              id,
              favoritedUsers: {
                some: {
                  id: session.user.id,
                },
              },
            },
          });

          if (favorite !== null) {
            (product as ProductWithIsFavorite).isFavorite = true;
          }
        }
        return product as ProductWithIsFavorite;
      },
    ),
  bySlug: publicProcedure
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
        const favorite = await prisma.product.findUnique({
          where: {
            slug: productSlug,
            favoritedUsers: {
              some: {
                id: session.user.id,
              },
            },
          },
        });

        if (favorite !== null) {
          (product as ProductWithIsFavorite).isFavorite = true;
        }
      }
      return product as ProductWithIsFavorite;
    }),
  create: protectedProcedure.input(productSchema).mutation(
    async ({
      input: {
        title,
        price,
        description,
        images,
        modelId,
        // bidDuration,
        multipleChoiceAnswers: providedChoices,
        atomicAnswers: providedAnswers,
        // couponCode,
      },
      ctx: { prisma, session, logger },
    }) => {
      // creating the product will not happen in the trpc router.
      // after implementing payment gateway, the product will be created there.
      // this is just for placeholder.

      // const closedAt = new Date();
      // closedAt.setDate(closedAt.getDate() + Number(bidDuration));

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
        return "Model not found";
      }

      const isValidValues = validateMultipleChoiceQuestionInput(
        model.multipleChoiceQuestions,
        providedChoices,
      );
      if (isValidValues !== true) {
        return "Invalid option";
      }

      const choiceValueIds: string[] = [];
      providedChoices.forEach((choice) =>
        choice.type === MultipleChoiceQuestionType.Checkbox
          ? choiceValueIds.push(...choice.valueIds)
          : choice.valueId && choiceValueIds.push(choice.valueId),
      );

      const isValidAnswers = validateAtomicQuestionAnswers(
        model.atomicQuestions,
        providedAnswers,
      );

      if (isValidAnswers !== true) {
        return "Invalid answers";
      }

      const product = await prisma.product.create({
        data: {
          title,
          slug: slugify(title, true),
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
              // closedAt,
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

      await logger.info({
        message: `${product.seller.name} created a new product: '${product.title}'`,
        state: product.model.createdState,
        detail: JSON.stringify({ productId: product.id }),
      });

      updateWishStatus(prisma, product);

      return product;
    },
  ),
  update: protectedProcedure
    .input(z.object({ id: idSchema, active: z.boolean() }))
    .mutation(async ({ input: { id, active }, ctx: { prisma, session } }) => {
      const user = session.user;
      const existingProduct = await prisma.product.findUnique({
        where: {
          id,
        },
        include: {
          seller: true,
        },
      });
      if (existingProduct === null) {
        return "Product not found";
      }
      if (!(await isAuthorized(existingProduct.seller, user))) {
        return "You are not the authorized of this product";
      }
      if (existingProduct.buyerId !== null) {
        return "Product is already sold";
      }
      const updatedProduct = await prisma.product.update({
        where: {
          id,
        },
        data: {
          active,
        },
        include: singleProductPayload.include,
      });
      return updatedProduct;
    }),

  delete: protectedProcedure
    .input(z.object({ productId: idSchema }))
    .mutation(
      async ({ input: { productId: id }, ctx: { prisma, session } }) => {
        const user = session.user;
        const existingProduct = await prisma.product.findUnique({
          where: {
            id,
          },
          include: {
            seller: true,
            // room: {
            //   include: {
            //     bids: {
            //       take: 1,
            //     },
            //   },
            // },
          },
        });
        if (existingProduct === null) {
          return "Product not found";
        }
        if (!(await isAuthorized(existingProduct.seller, user))) {
          return "You are not the seller of this product";
        }
        if (existingProduct.buyerId !== null) {
          return "Product is already sold";
        }
        // uncomment if needed
        // if (existingProduct.room.bids.length > 0) {
        //   return "Cannot delete product with bids";
        // }

        await prisma.product.update({
          where: { id },
          data: { isDeleted: true },
        });

        // const product = await prisma.product.delete({
        //   where: {
        //     id,
        //   },
        // });

        // void prisma.room
        //   .delete({
        //     where: {
        //       id: existingProduct.roomId,
        //     },
        //   })
        //   .catch((error) => {
        //     console.error({
        //       procedure: "deleteProductById",
        //       message: "cannot delete room",
        //       error,
        //     });
        //   });

        // existingProduct.images.forEach((image) => {
        //   // using void to not wait for the promise to resolve
        //   void deleteImage(image.publicId)
        //     .then((error) => {
        //       if (error instanceof Error) {
        //         console.error({
        //           procedure: "deleteProductById",
        //           message: `cannot delete image in cloudinary with publicId ${image.publicId}`,
        //           error,
        //         });
        //       }
        //     })
        //     .catch((error) => {
        //       console.error({
        //         procedure: "deleteProductById",
        //         message: "cannot delete images in cloudinary",
        //         error,
        //       });
        //     });
        // });
      },
    ),
  addToFavorites: protectedProcedure
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
          return "Product is already in favorites";
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
      },
    ),
  removeFromFavorites: protectedProcedure
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
          return "Product is not in favorites";
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
      },
    ),
});

async function isAuthorized(productSeller: User, user: User) {
  if (productSeller.id === user.id) {
    return true;
  }
  if (!user.roleId) {
    return false;
  }
  const role = await api.role.byId.query({ id: user.roleId });
  if (role === null) {
    return false;
  }
  const accessTypes = role.accesses.map((access) => access.type);
  return accessTypes.includes(AccessType.updateProduct);
}
