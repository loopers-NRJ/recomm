import { z } from "zod";

import { functionalityOptions, idSchema } from "@/utils/validation";

import {
  createTRPCRouter,
  getProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { AccessType } from "@prisma/client";

export const userRouter = createTRPCRouter({
  getUsers: publicProcedure
    .input(functionalityOptions.extend({ role: idSchema.optional() }))
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
              name: {
                contains: search,
              },
              role: role
                ? {
                    id: role,
                  }
                : undefined,
            },
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
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
            previusCursor: cursor,
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
                      categories: {
                        some: {
                          name: {
                            contains: search,
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          take: limit,

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
          previousCursor: cursor,
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
                  categories: {
                    some: {
                      name: {
                        contains: search,
                      },
                    },
                  },
                },
              ],
            },
          },
          take: limit,

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
          include: {
            model: true,
            room: {
              include: {
                bids: true,
              },
            },
            images: true,
          },
        });
        return {
          favoritedProducts,
          nextCursor: favoritedProducts[limit - 1]?.id,
          previousCursor: cursor,
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
                  categories: {
                    some: {
                      name: {
                        contains: search,
                      },
                    },
                  },
                },
              ],
            },
          },
          take: limit,

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
          include: {
            buyer: true,
            seller: true,
            model: true,
            room: true,
            images: true,
          },
        });
        return {
          listings,
          nextCursor: listings[limit - 1]?.id,
          previousCursor: cursor,
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
                  categories: {
                    some: {
                      name: {
                        contains: search,
                      },
                    },
                  },
                },
              ],
            },
          },
          take: limit,

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
        });
        return {
          purchases,
          nextCursor: purchases[limit - 1]?.id,
          previousCursor: cursor,
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
                  categories: {
                    some: {
                      name: {
                        contains: search,
                      },
                    },
                  },
                },
              ],
            },
          },
          take: limit,

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
          include: {
            category: true,
            brand: true,
            model: true,
          },
        });
        return {
          wishes,
          nextCursor: wishes[limit - 1]?.id,
          previousCursor: cursor,
        };
      }
    ),
});
