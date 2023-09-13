import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import { functionalityOptions, imageInputs } from "@/utils/validation";
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
              model: brandId
                ? {
                    brandId,
                    categories: categoryId
                      ? {
                          some: {
                            id: categoryId,
                          },
                        }
                      : undefined,
                  }
                : undefined,
              OR: [
                {
                  model: {
                    name: {
                      contains: search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  model: {
                    brand: {
                      name: {
                        contains: search,
                        mode: "insensitive",
                      },
                    },
                  },
                },
              ],
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
                  categories: true,
                },
              },
              room: true,
            },
          });
          return products;
        } catch (error) {
          console.error({
            procedure: "getProducts",
            error,
          });

          return new Error("Error fetching products");
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

        return new Error("Error fetching product");
      }
    }),
  createProduct: protectedProcedure
    .input(
      z.object({
        price: z.number().int().gt(0),
        description: z.string(),
        images: z.array(imageInputs),
        closedAt: z.date(),
        modelId: z.string().cuid(),
      })
    )
    .mutation(
      async ({
        input: { price, description, images, modelId, closedAt },
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
          });
          if (model === null) {
            return new Error("Model does not exist");
          }
          const product = await ctx.prisma.product.create({
            data: {
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
            },
            include: {
              buyer: true,
              seller: true,
              model: true,
              room: true,
            },
          });

          // Updating all the wishes with the modeiId to available
          await ctx.prisma.wish.updateMany({
            where: {
              modelId,
              status: WishStatus.pending,
            },
            data: {
              status: WishStatus.available,
            },
          });
          return product;
        } catch (error) {
          console.error({
            procedure: "createProduct",
            error,
          });
          return new Error("Error creating product");
        }
      }
    ),

  updateProductById: protectedProcedure
    .input(
      z.union([
        z.object({
          productId: z.string().cuid(),
          price: z.number().int().gt(0),
          description: z.string().optional(),
          // images: z.array(imageInputs).optional(),
        }),
        z.object({
          productId: z.string().cuid(),
          price: z.number().int().gt(0).optional(),
          description: z.string(),
          // images: z.array(imageInputs).optional(),
        }),
        z.object({
          productId: z.string().cuid(),
          price: z.number().int().gt(0).optional(),
          description: z.string().optional(),
          // images: z.array(imageInputs),
        }),
      ])
    )
    .mutation(async ({ input: { productId: id, description, price }, ctx }) => {
      try {
        const user = ctx.session.user;
        const existingProduct = await ctx.prisma.product.findUnique({
          where: {
            id,
          },
        });
        if (existingProduct === null) {
          return new Error("Product does not exist");
        }
        if (existingProduct.sellerId !== user.id) {
          return new Error("You are not the seller of this product");
        }
        const product = await ctx.prisma.product.update({
          where: {
            id,
          },
          data: {
            description,
            price,
          },
          include: {
            buyer: true,
            seller: true,
            model: true,
            room: true,
          },
        });
        return product;
      } catch (error) {
        console.error({
          procedure: "updateProductById",
          error,
        });

        return new Error("Error updating product");
      }
    }),
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
        return new Error("Error deleting product");
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
        return new Error("Error adding product to favorites");
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
        return new Error("Error removing product from favorites");
      }
    }),
});
