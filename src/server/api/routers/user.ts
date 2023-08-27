import { functionalityOptions } from "@/utils/validation";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";

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
          return new Error("Error fetching users");
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
        return new Error("Error fetching user");
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
          return new Error("Error fetching user bids");
        }
      }
    ),
  getMyFavoritesById: protectedProcedure
    .input(functionalityOptions.extend({ userId: z.string().cuid() }))
    .query(
      async ({
        input: { userId: id, limit, page, search, sortBy, sortOrder },
        ctx,
      }) => {
        const user = ctx.session.user;
        if (id !== user.id) {
          return new Error("Unauthorized");
        }
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
          });
          return favoritedProducts;
        } catch (error) {
          return new Error("Error fetching user favorites");
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
          return new Error("Error fetching user listings");
        }
      }
    ),
  getMyPurchasesById: protectedProcedure
    .input(functionalityOptions.extend({ userId: z.string().cuid() }))
    .query(
      async ({
        input: { userId: id, limit, page, search, sortBy, sortOrder },
        ctx,
      }) => {
        const user = ctx.session.user;
        if (id !== user.id) {
          return new Error("Unauthorized");
        }
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
          return new Error("Error fetching user purchases");
        }
      }
    ),
  getMywishesById: protectedProcedure
    .input(functionalityOptions.extend({ userId: z.string().cuid() }))
    .query(
      async ({
        input: { userId: id, limit, page, search, sortBy, sortOrder },
        ctx,
      }) => {
        const user = ctx.session.user;
        if (id !== user.id) {
          return new Error("Unauthorized");
        }
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
          });
          return wishes;
        } catch (error) {
          return new Error("Error fetching user wishes");
        }
      }
    ),
});
