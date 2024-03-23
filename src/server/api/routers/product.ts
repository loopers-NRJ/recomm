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
  type PrismaClient,
  type User,
} from "@prisma/client";

import slugify from "@/lib/slugify";
import {
  type ProductsPayloadIncluded,
  productsPayload,
  singleProductPayload,
  states,
} from "@/types/prisma";
import {
  DEFAULT_LIMIT,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  MAXIMUM_LIMIT,
} from "@/utils/constants";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { updateWishStatus } from "../updateWishStatus";
import { api } from "@/trpc/server";
import { type Logger, getLogger } from "@/utils/logger";

export const productRouter = createTRPCRouter({
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
            "updatedAt",
            "price",
            "active",
            "sellerName",
          ])
          .default(DEFAULT_SORT_BY),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional().or(z.array(idSchema)),
        modelId: idSchema.optional().or(z.array(idSchema)),
        state: z.enum(states),
        price: z
          .object({
            min: z.number().int().positive(),
            max: z.number().int().positive(),
          })
          .refine(({ min, max }) => min < max, {
            message: "minPrice should be less than maxPrice",
          })
          .optional(),
        choiceIds: z.array(idSchema).optional(),
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
          price,
          choiceIds,
        },
        ctx: { prisma, isAdminPage, session },
      }) => {
        const favorites: string[] = [];
        if (session.user) {
          const favoritedProducts = await prisma.product.findMany({
            where: {
              favoritedUsers: {
                some: {
                  id: session.user.id,
                },
              },
              active: true,
            },
            select: {
              id: true,
            },
          });
          favorites.push(...favoritedProducts.map((product) => product.id));
        }
        const products = await prisma.product.findMany({
          where: {
            modelId: modelId
              ? typeof modelId === "string"
                ? modelId
                : {
                    in: modelId,
                  }
              : undefined,
            isDeleted: isAdminPage ? undefined : false,
            active: isAdminPage ? undefined : true,
            title: {
              contains: search,
            },
            model: {
              active: isAdminPage ? undefined : true,
              category: {
                id: categoryId,
                active: isAdminPage ? undefined : true,
              },
              brandId: brandId
                ? typeof brandId === "string"
                  ? brandId
                  : {
                      in: brandId,
                    }
                : undefined,
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
            price: price
              ? {
                  gte: price.min,
                  lte: price.max,
                }
              : undefined,
            OR: choiceIds
              ? choiceIds.map((id) => ({
                  selectedChoices: {
                    some: { id },
                  },
                }))
              : undefined,
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

        type ProductWithIsFavorite = ProductsPayloadIncluded & {
          isFavorite: boolean | undefined;
        };

        const productsWithIsFavorite = products.map<ProductWithIsFavorite>(
          (product) => {
            if (session.user === undefined)
              return { ...product, isFavorite: undefined };
            const isFavorite = favorites.includes(product.id);
            return { ...product, isFavorite: isFavorite };
          },
        );

        return {
          products: productsWithIsFavorite,
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
        couponCode,
        addressId,
      },
      ctx: { prisma, session },
    }) => {
      // creating the product will not happen in the trpc router.
      // after implementing payment gateway, the product will be created there.
      // this is just for placeholder.

      // const closedAt = new Date();
      // closedAt.setDate(closedAt.getDate() + Number(bidDuration));
      const { user } = session;

      const product = await prisma.$transaction(async (prisma) => {
        const logger = getLogger(prisma as PrismaClient);
        // check whether the user can sell the product
        const userCanSellProduct = await checkUserCanSellProduct(
          user,
          prisma as PrismaClient,
          logger,
        );
        if (typeof userCanSellProduct === "string") {
          return userCanSellProduct;
        }

        // check for model existence
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
        // check for multiple choice answers validity
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

        // check for atomic answers validity
        const isValidAnswers = validateAtomicQuestionAnswers(
          model.atomicQuestions,
          providedAnswers,
        );

        if (isValidAnswers !== true) {
          return "Invalid answers";
        }

        // check for coupon code existence
        if (couponCode) {
          const coupon = await prisma.coupon.findUnique({
            where: {
              id: {
                code: couponCode,
                categoryId: model.categoryId,
              },
            },
          });
          if (coupon === null) {
            return "Coupon not found";
          }
        }

        // check for address existence
        const address = await prisma.address.findUnique({
          where: {
            id: addressId,
            userId: user.id,
          },
        });
        if (address === null) {
          return "Address not found";
        }

        const product = await prisma.product.create({
          data: {
            title,
            slug: slugify(title, true),
            price,
            description,
            address: {
              connect: {
                id: addressId,
              },
            },
            coupon: couponCode
              ? {
                  connect: {
                    id: {
                      code: couponCode,
                      categoryId: model.categoryId,
                    },
                  },
                }
              : undefined,
            images: {
              connect: images,
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

        if (userCanSellProduct === 2) {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              firstProductCreatedAtWithinTimeFrame: new Date(),
              productsCreatedCountWithinTimeFrame: 1,
            },
          });
        }
        if (userCanSellProduct === 1) {
          await prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              productsCreatedCountWithinTimeFrame:
                user.productsCreatedCountWithinTimeFrame + 1,
            },
          });
        }

        await logger.info({
          message: `${product.seller.name} created a new product: '${product.title}'`,
          state: product.model.createdState,
          detail: JSON.stringify({ productId: product.id }),
        });
        return product;
      });
      if (typeof product !== "string") {
        updateWishStatus(prisma, product);
      }
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
async function checkUserCanSellProduct(
  user: User,
  prisma: PrismaClient,
  logger: Logger,
) {
  const configurations = await prisma.appConfiguration.findMany({
    where: {
      key: {
        in: ["productSellingDurationInDays", "productSellingCount"],
      },
    },
  });
  const sellingDurationStr = configurations.find(
    (config) => config.key === "productSellingDurationInDays",
  )?.value;
  const sellingCountStr = configurations.find(
    (config) => config.key === "productSellingCount",
  )?.value;
  if (sellingDurationStr === undefined || sellingCountStr === undefined) {
    await logger.error({
      state: "common",
      message:
        "Product selling configurations not found, check the configuration names",
      detail: JSON.stringify({ userId: user.id }),
    });
    return "Something went wrong" as const;
  }
  const sellingDuration = Number(sellingDurationStr);
  const sellingCount = Number(sellingCountStr);
  if (isNaN(sellingDuration) || isNaN(sellingCount)) {
    await logger.error({
      state: "common",
      message:
        "Product selling configurations are not numbers. Enter a valid configurations",
      detail: JSON.stringify({ userId: user.id }),
    });
    return "Something went wrong" as const;
  }

  if (!user.firstProductCreatedAtWithinTimeFrame) {
    // the user didn't sell any products. so this field is null
    // in this case, the user can sell a product.
    // so set the firstProductCreatedAtWithinTimeFrame to now and productsCreatedCountWithinTimeFrame to 1
    return 2 as const;
  }
  // find the number of days between the firstProductCreatedAtWithinTimeFrame and now
  const daysPassed = getNumberOfDaysPassed(
    user.firstProductCreatedAtWithinTimeFrame,
  );
  if (daysPassed > sellingDuration) {
    // if the number of days passed between the first product created and now is greater than the selling duration
    // then the user can sell a product.
    // so reset the firstProductCreatedAtWithinTimeFrame to now and productsCreatedCountWithinTimeFrame to 1
    return 2 as const;
  }

  if (user.productsCreatedCountWithinTimeFrame < sellingCount) {
    // if the user has not reached the selling count
    // then the user can sell a product.
    // so increment the productsCreatedCountWithinTimeFrame by 1
    return 1 as const;
  }

  const daysLeft = sellingDuration - daysPassed;
  return `You cannot sell a product now. wait for ${daysLeft} days` as const;
}

function getNumberOfDaysPassed(date: Date) {
  const today = new Date();
  const timeDifference = today.getTime() - date.getTime();
  const daysDifference = Math.round(timeDifference / (1000 * 60 * 60 * 24));
  return daysDifference;
}
