import slugify from "slugify";
import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import {
  functionalityOptions,
  productSchema,
  validateVariant,
} from "@/utils/validation";
import { WishStatus } from "@prisma/client";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const productRouter = createTRPCRouter({
  getProducts: publicProcedure
    .input(
      functionalityOptions.extend({
        categoryId: z.string().cuid().optional(),
        brandId: z.string().cuid().optional(),
        modelId: z.string().cuid().optional(),
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
        },
        ctx,
      }) => {
        try {
          const products = await ctx.prisma.product.findMany({
            where: {
              modelId,
              model: {
                categoryId,
                brandId,
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                  {
                    category: {
                      name: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    brand: {
                      name: {
                        contains: search,
                        mode: "insensitive",
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
            include: {
              buyer: true,
              seller: true,
              model: {
                include: {
                  brand: true,
                  category: true,
                },
              },
              images: true,
              room: true,
            },
          });
          return products;
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
    .input(z.object({ productId: z.string().cuid() }))
    .query(async ({ input: { productId: id }, ctx }) => {
      try {
        const product = await ctx.prisma.product.findUnique({
          where: {
            id,
          },
          include: {
            buyer: true,
            seller: true,
            model: {
              include: {
                image: true,
                brand: {
                  include: {
                    image: true,
                  },
                },
              },
            },
            room: true,
            images: true,
            varientValues: {
              include: {
                option: true,
              },
            },
          },
        });
        type ProductWithIsFavorite = typeof product & { isFavorite?: true };
        if (ctx.session !== null) {
          const favorited = await ctx.prisma.product.findUnique({
            where: {
              id,
              favoritedUsers: {
                some: {
                  id: ctx.session.user.id,
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
          variantOptions: providedVariantOptions,
        },
        ctx,
      }) => {
        if (closedAt < new Date()) {
          return new Error("Closed at date must be in the future");
        }
        try {
          const user = ctx.session.user;
          const model = await ctx.prisma.model.findUnique({
            where: {
              id: modelId,
            },
            include: {
              variantOptions: {
                include: {
                  variantValues: true,
                },
              },
            },
          });
          if (model === null) {
            return new Error("Model does not exist");
          }

          const valid = validateVariant(
            model.variantOptions,
            providedVariantOptions
          );
          if (valid !== true) {
            return new Error("Invalid variant options");
          }

          const product = await ctx.prisma.product.create({
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
              varientValues: {
                connect: providedVariantOptions.map((variantOption) => ({
                  id: variantOption.valueId,
                })),
              },
            },
            include: {
              buyer: true,
              seller: true,
              model: true,
              room: true,
            },
          });

          // Updating all the wishes with the modeiId to available
          void ctx.prisma.wish
            .updateMany({
              where: {
                modelId,
                status: WishStatus.pending,
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
  //         productId: z.string().cuid(),
  //         price: z.number().int().gt(0),
  //         description: z.string().optional(),
  //         // images: z.array(imageInputs).optional(),
  //       }),
  //       z.object({
  //         productId: z.string().cuid(),
  //         price: z.number().int().gt(0).optional(),
  //         description: z.string(),
  //         // images: z.array(imageInputs).optional(),
  //       }),
  //       z.object({
  //         productId: z.string().cuid(),
  //         price: z.number().int().gt(0).optional(),
  //         description: z.string().optional(),
  //         // images: z.array(imageInputs),
  //       }),
  //     ])
  //   )
  //   .mutation(async ({ input: { productId: id, description, price }, ctx }) => {
  //     try {
  //       const user = ctx.session.user;
  //       const existingProduct = await ctx.prisma.product.findUnique({
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
  //       const product = await ctx.prisma.product.update({
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
    .input(z.object({ productId: z.string().cuid() }))
    .mutation(async ({ input: { productId: id }, ctx }) => {
      try {
        const user = ctx.session.user;
        const existingProduct = await ctx.prisma.product.findUnique({
          where: {
            id,
          },
          include: {
            room: {
              include: {
                bids: true,
              },
            },
            images: true,
          },
        });
        if (existingProduct === null) {
          return new Error("Product does not exist");
        }
        if (existingProduct.sellerId !== user.id) {
          return new Error("You are not the seller of this product");
        }
        if (existingProduct.buyerId !== null) {
          return new Error("Product is already sold");
        }
        if (existingProduct.room.bids.length > 0) {
          return new Error("Cannot delete product with bids");
        }
        const product = await ctx.prisma.product.delete({
          where: {
            id,
          },
        });

        void ctx.prisma.room
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
    }),
  addProductToFavorites: protectedProcedure
    .input(z.object({ productId: z.string().cuid() }))
    .mutation(async ({ input: { productId: id }, ctx }) => {
      try {
        const user = ctx.session.user;
        // const existingProduct = await ctx.prisma.product.findUnique({
        //   where: {
        //     id,
        //   },
        // });
        // if (existingProduct === null) {
        //   return new Error("Product does not exist");
        // }
        const productInFavorites = await ctx.prisma.product.findUnique({
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
        await ctx.prisma.user.update({
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
    }),
  removeProductFromFavorites: protectedProcedure
    .input(z.object({ productId: z.string().cuid() }))
    .mutation(async ({ input: { productId: id }, ctx }) => {
      try {
        const user = ctx.session.user;
        // const existingProduct = await ctx.prisma.product.findUnique({
        //   where: {
        //     id,
        //   },
        // });
        // if (existingProduct === null) {
        //   return new Error("Product does not exist");
        // }
        const productInFavorites = await ctx.prisma.product.findUnique({
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
        await ctx.prisma.user.update({
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
    }),
});
