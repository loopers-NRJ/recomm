import { z } from "zod";

import { idSchema } from "@/utils/validation";

import {
  createTRPCRouter,
  getProcedure,
  protectedProcedure,
  publicProcedure,
} from "../trpc";
import { AccessType } from "@prisma/client";
import { productsPayload, wishPayload } from "@/types/prisma";
import {
  DEFAULT_LIMIT,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  MAXIMUM_LIMIT,
} from "@/utils/constants";

export const userRouter = createTRPCRouter({
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
            "email",
            "createdAt",
            "updatedAt",
            "role",
            "lastActive",
          ])
          .default(DEFAULT_SORT_BY),
        cursor: idSchema.optional(),
        role: idSchema.optional(),
      }),
    )
    .query(
      async ({
        input: { limit, search, sortBy, sortOrder, cursor, role },
        ctx: { prisma },
      }) => {
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
      },
    ),
  byId: publicProcedure
    .input(z.object({ userId: idSchema }))
    .query(async ({ input: { userId: id }, ctx: { prisma } }) => {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (user === null) {
        return "User not found";
      }
      return user;
    }),
  updateRole: getProcedure(AccessType.updateUsersRole)
    .input(z.object({ userId: idSchema, roleId: idSchema.nullable() }))
    .mutation(
      async ({
        input: { userId: id, roleId },
        ctx: { prisma, session, logger },
      }) => {
        const user = await prisma.user.update({
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
          include: { role: true },
        });

        await logger.info({
          message: `'${session.user.name}' promoted '${user.name}' as '${user.role?.name}'`,
          state: "common",
        });
      },
    ),
  bids: protectedProcedure
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
        cursor: idSchema.optional(),
      }),
    )
    .query(
      async ({
        input: { limit, search, sortOrder, cursor },
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
              createdAt: sortOrder,
            },
          ],
        });
        return {
          bids,
          nextCursor: bids[limit - 1]?.id,
        };
      },
    ),
  favorites: protectedProcedure
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
          .enum(["name", "createdAt", "updatedAt", "price", "sellerName"])
          .default(DEFAULT_SORT_BY),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        modelId: idSchema.optional(),
      }),
    )
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
            active: true,
            model: {
              OR: [ 
                { name: { contains: search, }, },
                { brand: { name: { contains: search, } } },
                { category: { name: { contains: search, }, }, },
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
          favoritedProducts,
          nextCursor: favoritedProducts[limit - 1]?.id,
        };
      },
    ),

  listingsById: publicProcedure
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
          .enum(["name", "createdAt", "updatedAt", "price", "sellerName"])
          .default(DEFAULT_SORT_BY),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        modelId: idSchema.optional(),
        userId: idSchema,
      }),
    )
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
          listings,
          nextCursor: listings[limit - 1]?.id,
        };
      },
    ),
  purchases: protectedProcedure
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
          .enum(["name", "createdAt", "updatedAt", "price", "sellerName"])
          .default(DEFAULT_SORT_BY),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        modelId: idSchema.optional(),
      }),
    )
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
          purchases,
          nextCursor: purchases[limit - 1]?.id,
        };
      },
    ),
  wishes: protectedProcedure
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
            "status",
            "createdAt",
            "updatedAt",
            "categoryName",
            "brandName",
            "modelName",
          ])
          .default(DEFAULT_SORT_BY),
        cursor: idSchema.optional(),
        categoryId: idSchema.optional(),
        brandId: idSchema.optional(),
        modelId: idSchema.optional(),
      }),
    )
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
            sortBy === "brandName"
              ? {
                brand: {
                  name: sortOrder,
                },
              }
              : sortBy === "categoryName"
                ? {
                  category: {
                    name: sortOrder,
                  },
                }
                : sortBy === "modelName"
                  ? {
                    model: {
                      name: sortOrder,
                    },
                  }
                  : {
                    [sortBy]: sortOrder,
                  },
          ],
          include: wishPayload.include,
        });
        return {
          wishes,
          nextCursor: wishes[limit - 1]?.id,
        };
      },
    ),
});
