import slugify from "slugify";
import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import {
  functionalityOptions,
  idSchema,
  productSchema,
  validateOptionValues,
  validateQuestionAnswers,
} from "@/utils/validation";
import { OptionType, Role, WishStatus } from "@prisma/client";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { productsPayload, singleProductPayload } from "@/types/prisma";

export const productRouter = createTRPCRouter({
  getProducts: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        modelId: idSchema.optional(),
        active: z.boolean().default(true),
      })
    )
    .query(
      async ({
        input: {
          limit,
          page,
          search,
          sortBy,
          sortOrder,
          categoryId,
          brandId,
          modelId,
          active,
        },
        ctx: { prisma },
      }) => {
        try {
          const [count, products] = await prisma.$transaction([
            prisma.product.count({
              where: {
                modelId,
                model: {
                  categories: {
                    some: {
                      id: categoryId,
                      active,
                    },
                  },
                  brandId,
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
            }),
            prisma.product.findMany({
              where: {
                modelId,
                model: {
                  categories: {
                    some: {
                      id: categoryId,
                      active,
                    },
                  },
                  brandId,
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
              skip: limit * (page - 1),
              take: limit,
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
            }),
          ]);
          return {
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            products,
          };
        } catch (error) {
          console.error({
            procedure: "getProducts",
            error,
          });

          return new Error("Something went wrong!");
        }
      }
    ),
  getProductById: publicProcedure
    .input(z.object({ productId: idSchema }))
    .query(async ({ input: { productId: id }, ctx: { prisma, session } }) => {
      try {
        const product = await prisma.product.findUnique({
          where: {
            id,
          },
          include: singleProductPayload.include,
        });
        type ProductWithIsFavorite = typeof product & { isFavorite?: true };
        if (session !== null) {
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
      } catch (error) {
        console.error({
          procedure: "getProductById",
          error,
        });

        return new Error("Something went wrong!");
      }
    }),
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
          options: providedOptions,
          answers: providedAnswers,
        },
        ctx: { prisma, session },
      }) => {
        if (closedAt < new Date()) {
          return new Error("Closed at date must be in the future");
        }
        try {
          const user = session.user;
          const model = await prisma.model.findUnique({
            where: {
              id: modelId,
            },
            include: {
              options: {
                include: {
                  values: true,
                },
              },
              questions: true,
            },
          });
          if (model === null) {
            return new Error("Model does not exist");
          }

          const isValidValues = validateOptionValues(
            model.options,
            providedOptions
          );
          if (isValidValues !== true) {
            return new Error("Invalid variant options");
          }

          const optionValueIds: string[] = [];
          providedOptions.forEach((variantOption) =>
            variantOption.type === OptionType.Checkbox
              ? optionValueIds.push(...variantOption.valueIds)
              : optionValueIds.push(variantOption.valueId)
          );

          const isValidAnswers = validateQuestionAnswers(
            model.questions,
            providedAnswers
          );

          if (isValidAnswers !== true) {
            return new Error("Invalid answers");
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
              optionValues: {
                connect: optionValueIds.map((id) => ({ id })),
              },
              answers: {
                createMany: {
                  data: providedAnswers.map((answer) => ({
                    answer:
                      answer.answer instanceof Date
                        ? answer.answer.getTime().toString()
                        : `${answer.answer}`,
                    questionId: answer.questionId,
                    modelId,
                  })),
                },
              },
            },
            include: singleProductPayload.include,
          });

          // Updating all the wishes with the modeiId to available
          void prisma.wish
            .updateMany({
              where: {
                modelId,
                status: WishStatus.pending,
                lowerBound: {
                  gte: price,
                },
                upperBound: {
                  lte: price,
                },
              },
              data: {
                status: WishStatus.available,
              },
            })
            .catch((error) => {
              console.error({
                procedure: "createProduct",
                message: "cannot update wishes",
                error,
              });
            });

          return product;
        } catch (error) {
          console.error({
            procedure: "createProduct",
            error,
          });
          return new Error("Something went wrong!");
        }
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
  //         return new Error("Product does not exist");
  //       }
  //       if (existingProduct.sellerId !== user.id) {
  //         return new Error("You are not the seller of this product");
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

  //       return new Error("Something went wrong!");
  //     }
  //   }),
  deleteProductById: protectedProcedure
    .input(z.object({ productId: idSchema }))
    .mutation(
      async ({ input: { productId: id }, ctx: { prisma, session } }) => {
        try {
          const user = session.user;
          const existingProduct = await prisma.product.findUnique({
            where: {
              id,
            },
            include: singleProductPayload.include,
          });
          if (existingProduct === null) {
            return new Error("Product does not exist");
          }
          if (
            existingProduct.sellerId !== user.id &&
            user.role !== Role.DELETE
          ) {
            return new Error("You are not the seller of this product");
          }
          if (existingProduct.buyerId !== null) {
            return new Error("Product is already sold");
          }
          if (existingProduct.room.bids.length > 0) {
            return new Error("Cannot delete product with bids");
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
        } catch (error) {
          console.error({
            procedure: "deleteProductById",
            error,
          });
          return new Error("Something went wrong!");
        }
      }
    ),
  addProductToFavorites: protectedProcedure
    .input(z.object({ productId: idSchema }))
    .mutation(
      async ({ input: { productId: id }, ctx: { prisma, session } }) => {
        try {
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
            return new Error("Product is already in favorites");
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
        } catch (error) {
          console.error({
            procedure: "addProductToFavorites",
            error,
          });
          return new Error("Something went wrong!");
        }
      }
    ),
  removeProductFromFavorites: protectedProcedure
    .input(z.object({ productId: idSchema }))
    .mutation(
      async ({ input: { productId: id }, ctx: { prisma, session } }) => {
        try {
          const user = session.user;
          // const existingProduct = await prisma.product.findUnique({
          //   where: {
          //     id,
          //   },
          // });
          // if (existingProduct === null) {
          //   return new Error("Product does not exist");
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
            return new Error("Product is not in favorites");
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
        } catch (error) {
          console.error({
            procedure: "removeProductFromFavorites",
            error,
          });
          return new Error("Something went wrong!");
        }
      }
    ),
});
