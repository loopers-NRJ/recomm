import { z } from "zod";

import { functionalityOptions, idSchema } from "@/utils/validation";

import {
  createTRPCRouter,
  getProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { AccessType } from "@prisma/client";
import { productsPayload, wishPayload } from "@/types/prisma";
import {
  DefaultLimit,
  DefaultSortBy,
  DefaultSortOrder,
  MaxLimit,
} from "@/utils/constants";

export const userRouter = createTRPCRouter({
  getUsers: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(MaxLimit).default(DefaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(DefaultSortOrder),
        sortBy: z
          .enum([
            "name",
            "email",
            "createdAt",
            "updatedAt",
            "role",
            "lastActive",
          ])
          .default(DefaultSortBy),
        cursor: idSchema.optional(),
        role: idSchema.optional(),
      })
    )
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, cursor, role },
        ctx: { prisma },
      }) => {
        try {
          const users = await prisma.user.findMany({
            take: limit,

            cursor: cursor
              ? {
                  id: cursor,
                }
              : undefined,
            where: {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  email: {
                    contains: search,
                  },
                },
              ],
              role: role
                ? {
                    id: role,
                  }
                : undefined,
            },
            orderBy: [
              sortBy === "role"
                ? {
                    role: {
                      name: sortOrder,
                    },
                  }
                : {
                    [sortBy]: sortOrder,
                  },
            ],
            skip: cursor ? 1 : undefined,
            include: {
              role: {
                include: {
                  accesses: true,
                },
              },
            },
          });

          return {
            users,
            nextCursor: users[limit - 1]?.id,
          };
        } catch (error) {
          throw new Error("Something went wrong!");
        }
      }
    ),
  getUserById: publicProcedure
    .input(z.object({ userId: idSchema }))
    .query(async ({ input: { userId: id }, ctx: { prisma } }) => {
      try {
        const user = await prisma.user.findUnique({
          where: {
            id,
          },
        });
        if (user === null) {
          throw new Error("User not found");
        }
        return user;
      } catch (error) {
        throw new Error("Something went wrong!");
      }
    }),
  updateUserRole: getProcedure(AccessType.updateUsersRole)
    .input(z.object({ userId: idSchema, roleId: idSchema.nullable() }))
    .mutation(async ({ input: { userId: id, roleId }, ctx: { prisma } }) => {
      await prisma.user.update({
        where: {
          id,
        },
        data: {
          role: roleId
            ? {
                connect: {
                  id: roleId,
                },
              }
            : {
                disconnect: true,
              },
        },
      });
    }),
  getMyBids: protectedProcedure
    .input(functionalityOptions)
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, cursor },
        ctx: { prisma, session },
      }) => {
        const user = session.user;
        const bids = await prisma.bid.findMany({
          where: {
            userId: user.id,
            room: {
              product: {
                model: {
                  OR: [
                    {
                      name: {
                        contains: search,
                      },
                    },
                    {
                      brand: {
                        name: {
                          contains: search,
                        },
                      },
                    },
                    {
                      category: {
                        name: {
                          contains: search,
                        },
                      },
                    },
                  ],
                },
              },
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
        return {
          bids,
          nextCursor: bids[limit - 1]?.id,
        };
      }
    ),
  getMyFavorites: protectedProcedure
    .input(functionalityOptions)
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, cursor },
        ctx: { prisma, session },
      }) => {
        const id = session.user.id;
        const favoritedProducts = await prisma.product.findMany({
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
                  },
                },
                {
                  brand: {
                    name: {
                      contains: search,
                    },
                  },
                },
                {
                  category: {
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
          favoritedProducts,
          nextCursor: favoritedProducts[limit - 1]?.id,
        };
      }
    ),
  getUserListingsById: publicProcedure
    .input(functionalityOptions.extend({ userId: idSchema }))
    .query(
      async ({
        input: { search, userId: id, limit, sortBy, sortOrder, cursor },
        ctx: { prisma },
      }) => {
        const listings = await prisma.product.findMany({
          where: {
            sellerId: id,
            model: {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  brand: {
                    name: {
                      contains: search,
                    },
                  },
                },
                {
                  category: {
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
          listings,
          nextCursor: listings[limit - 1]?.id,
        };
      }
    ),
  getMyPurchases: protectedProcedure
    .input(functionalityOptions)
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, cursor },
        ctx: { prisma, session },
      }) => {
        const id = session.user.id;
        const purchases = await prisma.product.findMany({
          where: {
            buyerId: id,
            model: {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  brand: {
                    name: {
                      contains: search,
                    },
                  },
                },
                {
                  category: {
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
          purchases,
          nextCursor: purchases[limit - 1]?.id,
        };
      }
    ),
  getMywishes: protectedProcedure
    .input(functionalityOptions)
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, cursor },
        ctx: { prisma, session },
      }) => {
        const id = session.user.id;
        const wishes = await prisma.wish.findMany({
          where: {
            userId: id,
            model: {
              OR: [
                {
                  name: {
                    contains: search,
                  },
                },
                {
                  brand: {
                    name: {
                      contains: search,
                    },
                  },
                },
                {
                  category: {
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
          include: wishPayload.include,
        });
        return {
          wishes,
          nextCursor: wishes[limit - 1]?.id,
        };
      }
    ),
});
