import { functionalityOptions } from "@/utils/validation";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { WishStatus } from "@prisma/client";

export const productRouter = createTRPCRouter({
  getProducts: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { limit, page, search, sortBy, sortOrder }, ctx }) => {
        try {
          const products = await ctx.prisma.product.findMany({
            where: {
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
              room: {
                include: {
                  highestBid: true,
                },
              },
            },
          });
          return products;
        } catch (error) {
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
            model: true,
            room: {
              include: {
                highestBid: true,
              },
            },
          },
        });
        return product;
      } catch (error) {
        return new Error("Error fetching product");
      }
    }),
  createProduct: protectedProcedure
    .input(
      z.object({
        price: z.number().int().gt(0),
        description: z.string(),
        images: z.array(z.string().url()),
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
              images,
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
          /**
           * Updating all the wishes with the modeiId to available
           */
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
          images: z.array(z.string().url()).optional(),
        }),
        z.object({
          productId: z.string().cuid(),
          price: z.number().int().gt(0).optional(),
          description: z.string(),
          images: z.array(z.string().url()).optional(),
        }),
        z.object({
          productId: z.string().cuid(),
          price: z.number().int().gt(0).optional(),
          description: z.string().optional(),
          images: z.array(z.string().url()),
        }),
      ])
    )
    .mutation(async ({ input: { productId: id, ...data }, ctx }) => {
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
          data,
          include: {
            buyer: true,
            seller: true,
            model: true,
            room: true,
          },
        });
        return product;
      } catch (error) {
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
          include: {
            buyer: true,
            seller: true,
            model: true,
            room: true,
          },
        });
        return product;
      } catch (error) {
        return new Error("Error deleting product");
      }
    }),
  addProductToFavorites: protectedProcedure
    .input(z.object({ productId: z.string().cuid() }))
    .mutation(async ({ input: { productId: id }, ctx }) => {
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
        return true;
      } catch (error) {
        return new Error("Error adding product to favorites");
      }
    }),
  removeProductFromFavorites: protectedProcedure
    .input(z.object({ productId: z.string().cuid() }))
    .mutation(async ({ input: { productId: id }, ctx }) => {
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
        return true;
      } catch (error) {
        return new Error("Error removing product from favorites");
      }
    }),
});
