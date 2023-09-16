import { z } from "zod";

import { functionalityOptions } from "@/utils/validation";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getUsers: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { limit, page, search, sortBy, sortOrder }, ctx }) => {
        try {
          const users = await ctx.prisma.user.findMany({
            take: limit,
            skip: (page - 1) * limit,
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
          });
          return users;
        } catch (error) {
          return new Error("Something went wrong!");
        }
      }
    ),
  getUserById: publicProcedure
    .input(z.object({ userId: z.string().cuid() }))
    .query(async ({ input: { userId: id }, ctx }) => {
      try {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id,
          },
        });
        if (user === null) {
          return new Error("User not found");
        }
        return user;
      } catch (error) {
        return new Error("Something went wrong!");
      }
    }),
  getMyBids: protectedProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { limit, page, search, sortBy, sortOrder }, ctx }) => {
        try {
          const user = ctx.session.user;
          const bids = await ctx.prisma.bid.findMany({
            where: {
              userId: user.id,
              room: {
                product: {
                  model: {
                    OR: [
                      {
                        name: {
                          contains: search,
                          mode: "insensitive",
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
              },
            },
            take: limit,
            skip: (page - 1) * limit,
            orderBy: [
              {
                room: {
                  product: {
                    model: {
                      name: sortBy === "name" ? sortOrder : undefined,
                    },
                  },
                },
              },
              {
                createdAt: sortBy === "createdAt" ? sortOrder : undefined,
              },
            ],
          });
          return bids;
        } catch (error) {
          return new Error("Something went wrong!");
        }
      }
    ),
  getMyFavorites: protectedProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { limit, page, search, sortBy, sortOrder }, ctx }) => {
        const id = ctx.session.user.id;

        try {
          const favoritedProducts = await ctx.prisma.product.findMany({
            where: {
              favoritedUsers: {
                some: {
                  id,
                },
              },
              model: {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
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
            take: limit,
            skip: (page - 1) * limit,
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
              model: true,
              room: {
                include: {
                  bids: true,
                },
              },
            },
          });
          return favoritedProducts;
        } catch (error) {
          return new Error("Something went wrong!");
        }
      }
    ),
  getUserListingsById: publicProcedure
    .input(functionalityOptions.extend({ userId: z.string().cuid() }))
    .query(
      async ({
        input: { userId: id, limit, page, search, sortBy, sortOrder },
        ctx,
      }) => {
        try {
          const listings = await ctx.prisma.product.findMany({
            where: {
              sellerId: id,
              model: {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
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
            take: limit,
            skip: (page - 1) * limit,
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
              model: true,
              room: true,
            },
          });
          return listings;
        } catch (error) {
          return new Error("Something went wrong!");
        }
      }
    ),
  getMyPurchases: protectedProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { limit, page, search, sortBy, sortOrder }, ctx }) => {
        const id = ctx.session.user.id;
        try {
          const purchases = await ctx.prisma.product.findMany({
            where: {
              buyerId: id,
              model: {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
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
            take: limit,
            skip: (page - 1) * limit,
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
          });
          return purchases;
        } catch (error) {
          return new Error("Something went wrong!");
        }
      }
    ),
  getMywishes: protectedProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { limit, page, search, sortBy, sortOrder }, ctx }) => {
        const id = ctx.session.user.id;
        try {
          const wishes = await ctx.prisma.wish.findMany({
            where: {
              userId: id,
              model: {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive",
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
            take: limit,
            skip: (page - 1) * limit,
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
              model: {
                include: {
                  brand: true,
                },
              },
            },
          });
          return wishes;
        } catch (error) {
          return new Error("Something went wrong!");
        }
      }
    ),
});
