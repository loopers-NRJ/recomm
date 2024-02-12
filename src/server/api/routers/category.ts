import slugify from "@/lib/slugify";
import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import {
  createTRPCRouter,
  getProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  CategoryPayload,
  FeaturedCategoryPayload,
  states,
} from "@/types/prisma";
import {
  defaultLimit,
  defaultSortBy,
  defaultSortOrder,
  maxFeaturedCategory,
  maxLimit,
} from "@/utils/constants";
import { idSchema, imageInputs } from "@/utils/validation";
import { AccessType } from "@prisma/client";

export const categoryRouter = createTRPCRouter({
  all: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt", "active", "featured"])
          .default(defaultSortBy),
        cursor: idSchema.optional(),
        parentId: idSchema.nullish(),
        parentSlug: z.string().min(1).max(255).nullish(),
        state: z.enum(states),
      }),
    )
    .query(
      async ({
        input: {
          search,
          limit,
          sortBy,
          sortOrder,
          parentId,
          cursor,
          parentSlug,
          state,
        },
        ctx: { prisma, isAdminPage },
      }) => {
        const categories = await prisma.category.findMany({
          where: {
            name: {
              contains: search,
            },
            active: isAdminPage ? undefined : true,
            parentCategoryId: parentId,
            parentCategory: parentSlug
              ? {
                  slug: parentSlug,
                }
              : undefined,
            createdState: state,
          },
          cursor: cursor
            ? {
                id: cursor,
              }
            : undefined,

          take: limit,
          skip: cursor ? 1 : undefined,
          orderBy: [
            sortBy === "featured"
              ? {
                  featuredCategory: {
                    category: {
                      name: sortOrder,
                    },
                  },
                }
              : {
                  [sortBy]: sortOrder,
                },
          ],
          include: CategoryPayload.include,
        });
        return {
          categories,
          nextCursor: categories[limit - 1]?.id,
        };
      },
    ),

  allWithoutPayload: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt", "active", "featured"])
          .default(defaultSortBy),
        cursor: idSchema.optional(),
        parentId: idSchema.nullish(),
        parentSlug: z.string().min(1).max(255).nullish(),
        state: z.enum(states),
      }),
    )
    .query(
      async ({
        input: {
          search,
          limit,
          sortBy,
          sortOrder,
          parentId,
          cursor,
          parentSlug,
          state,
        },
        ctx: { prisma, isAdminPage },
      }) => {
        const categories = await prisma.category.findMany({
          where: {
            name: {
              contains: search,
            },
            active: isAdminPage ? undefined : true,
            parentCategoryId: parentId,
            parentCategory: parentSlug
              ? {
                  slug: parentSlug,
                }
              : undefined,
            createdState: state,
          },
          cursor: cursor
            ? {
                id: cursor,
              }
            : undefined,

          take: limit,
          skip: cursor ? 1 : undefined,
          orderBy: [
            {
              [sortBy]: sortOrder,
            },
          ],
        });
        return {
          categories,
          nextCursor: categories[limit - 1]?.id,
        };
      },
    ),
  byId: publicProcedure
    .input(z.object({ categoryId: idSchema.nullable() }))
    .query(async ({ input: { categoryId: id }, ctx: { prisma } }) => {
      if (!id) {
        return null;
      }
      const category = await prisma.category.findUnique({
        where: {
          id,
        },
        include: CategoryPayload.include,
      });
      if (category === null) {
        return "Category not found";
      }
      return category;
    }),
  bySlug: publicProcedure
    .input(z.object({ categorySlug: z.string().min(1).max(255) }))
    .query(async ({ input: { categorySlug: slug }, ctx: { prisma } }) => {
      const category = await prisma.category.findUnique({
        where: {
          slug,
        },
        include: {
          featuredCategory: {
            include: {
              image: true,
            },
          },
        },
      });
      if (category === null) {
        return "Category not found";
      }
      return category;
    }),

  create: getProcedure(AccessType.createCategory)
    .input(
      z.object({
        name: z.string().min(3).max(255),
        parentCategoryId: idSchema.optional(),
        state: z.enum(states),
      }),
    )
    .mutation(
      async ({
        input: { name, parentCategoryId, state },
        ctx: { prisma, session, logger },
      }) => {
        // checking whether the category already exists
        const existingCategory = await prisma.category.findFirst({
          where: {
            name,
            parentCategoryId,
            createdState: state,
          },
          select: {
            name: true,
          },
        });
        if (existingCategory !== null) {
          return `Category with name '${existingCategory.name}' already exists` as const;
        }
        // creating the category
        const category = await prisma.category.create({
          data: {
            name,
            slug: slugify(name),
            createdBy: {
              connect: {
                id: session.user.id,
              },
            },
            createdState: state,
            parentCategory: parentCategoryId
              ? {
                  connect: {
                    id: parentCategoryId,
                  },
                }
              : undefined,
          },
          include: CategoryPayload.include,
        });

        await logger.info({
          message: `'${session.user.name}' created a category named '${category.name}'`,
          state,
        });

        return category;
      },
    ),
  update: getProcedure(AccessType.updateCategory)
    .input(
      z.union([
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255),
          parentCategoryId: idSchema.optional(),
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          parentCategoryId: idSchema,
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          parentCategoryId: idSchema.optional(),
          active: z.boolean(),
        }),
      ]),
    )
    .mutation(async ({ input, ctx: { prisma, session, logger } }) => {
      const existingCategory = await prisma.category.findUnique({
        where: {
          id: input.id,
        },
      });
      if (existingCategory === null) {
        return "Category not found";
      }
      // checking whether the new name already exists
      if (input.name !== undefined && input.name !== existingCategory.name) {
        const existingName = await prisma.category.findFirst({
          where: {
            name: {
              equals: input.name,
            },
            createdState: existingCategory.createdState,
          },
          select: {
            id: true,
          },
        });
        if (existingName !== null) {
          return `Category with name '${input.name}' already exists` as const;
        }
      }

      const updatedCategory = await prisma.category.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          slug: input.name ? slugify(input.name) : undefined,
          parentCategory: input.parentCategoryId
            ? {
                connect: {
                  id: input.parentCategoryId,
                },
              }
            : undefined,
          active: input.active,
          updatedBy: {
            connect: {
              id: session.user.id,
            },
          },
        },
        include: CategoryPayload.include,
      });

      if (input.name) {
        await logger.info({
          message: `'${session.user.name}' updated a category's name from '${existingCategory.name}' to '${updatedCategory.name}'`,
          state: existingCategory.createdState,
        });
      }
      if (input.active !== undefined) {
        await logger.info({
          message: `'${session.user.name}' updated a category's active state from '${existingCategory.active}' to '${updatedCategory.active}'`,
          state: existingCategory.createdState,
        });
      }
      if (input.parentCategoryId) {
        await logger.info({
          message: `'${session.user.name}' updated a category's parentId from '${existingCategory.parentCategoryId}' to '${updatedCategory.parentCategoryId}'`,
          state: existingCategory.createdState,
        });
      }

      return updatedCategory;
    }),
  delete: getProcedure(AccessType.deleteCategory)
    .input(z.object({ categoryId: idSchema }))
    .mutation(
      async ({
        input: { categoryId: id },
        ctx: { prisma, session, logger },
      }) => {
        // checking whether the category exists

        const existingCategory = await prisma.category.findUnique({
          where: {
            id,
          },
          select: {
            name: true,
            createdState: true,
            subCategories: {
              select: {
                id: true,
              },
            },
            models: {
              select: {
                id: true,
              },
            },
            wishes: {
              select: {
                id: true,
              },
            },
          },
        });
        if (existingCategory === null) {
          return "Category not found";
        }
        if (existingCategory.subCategories.length > 0) {
          return `Cannot delete the category '${existingCategory.name}' because it has subcategories.` as const;
        }
        if (existingCategory.models.length > 0) {
          return `Cannot delete the category '${existingCategory.name}'. it's in use by some models` as const;
        }
        if (existingCategory.wishes.length > 0) {
          return `Cannot delete the category '${existingCategory.name}'. Some users have wished for it` as const;
        }
        // deleting the category
        const category = await prisma.category.delete({
          where: {
            id,
          },
        });

        await logger.info({
          message: `'${session.user.name}' deleted a category named '${category.name}'`,
          state: existingCategory.createdState,
        });

        return category;
      },
    ),
  featured: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt", "active"])
          .default(defaultSortBy),
        cursor: idSchema.optional(),
        state: z.enum(states),
      }),
    )
    .query(
      async ({
        input: { search, limit, sortBy, sortOrder, cursor, state },
        ctx: { prisma, isAdminPage },
      }) => {
        const categories = await prisma.featuredCategory.findMany({
          where: {
            category: {
              name: {
                contains: search,
              },
              active: isAdminPage ? undefined : true,
              createdState: state,
            },
          },
          cursor: cursor
            ? {
                categoryId: cursor,
              }
            : undefined,

          take: limit,
          skip: cursor ? 1 : undefined,
          orderBy: [
            {
              category: {
                [sortBy]: sortOrder,
              },
            },
          ],
          include: FeaturedCategoryPayload.include,
        });

        return {
          categories,
          nextCursor: categories[limit - 1]?.categoryId,
        };
      },
    ),

  addToFeatured: getProcedure(AccessType.updateCategory)
    .input(z.object({ categoryId: idSchema, image: imageInputs }))
    .mutation(
      async ({
        input: { categoryId: id, image },
        ctx: { prisma, session, logger },
      }) => {
        const totalFeaturedCategories = await prisma.featuredCategory.count();
        if (totalFeaturedCategories >= maxFeaturedCategory) {
          return "Cannot make the category as featured. Maximum featured category limit reached";
        }
        const existingFeatured = await prisma.featuredCategory.findUnique({
          where: {
            categoryId: id,
          },
          select: {
            category: { select: { name: true } },
          },
        });
        if (existingFeatured !== null) {
          return `Category ${existingFeatured.category.name} is already featured` as const;
        }
        const data = await prisma.featuredCategory.create({
          data: {
            category: {
              connect: {
                id,
              },
            },
            image: {
              create: image,
            },
            featuredBy: {
              connect: {
                id: session.user.id,
              },
            },
          },
          select: {
            category: true,
          },
        });

        await logger.info({
          message: `'${session.user.name}' promoted a category named '${data.category.name}' to featured category`,
          state: data.category.createdState,
        });

        return data.category;
      },
    ),
  removeFromFeatured: getProcedure(AccessType.updateCategory)
    .input(z.object({ categoryId: idSchema }))
    .mutation(
      async ({
        input: { categoryId: id },
        ctx: { prisma, session, logger },
      }) => {
        const existingCategory = await prisma.featuredCategory.findUnique({
          where: {
            categoryId: id,
          },
          select: {
            image: {
              select: {
                publicId: true,
              },
            },
            category: {
              select: {
                name: true,
                createdState: true,
              },
            },
          },
        });
        if (existingCategory === null) {
          return "Category not found";
        }
        await prisma.featuredCategory.delete({
          where: {
            categoryId: id,
          },
        });

        const error = await deleteImage(existingCategory.image.publicId);
        if (error) {
          await logger.error({
            message: "cannot able delete the old image in cloudinary",
            state: existingCategory.category.createdState,
            detail: JSON.stringify({
              procedure: "removeCategoryFromFeaturedById",
              message: "cannot able delete the old image in cloudinary",
              existingCategory,
              error,
            }),
          });
          return `Cannot able to delete the of the category ${existingCategory.category.name}` as const;
        }
        await logger.info({
          message: `'${session.user.name}' demoted a featured category named '${existingCategory.category.name}' to category`,
          state: existingCategory.category.createdState,
        });
      },
    ),

  updateFeatured: getProcedure(AccessType.updateCategory)
    .input(z.object({ categoryId: idSchema, image: imageInputs }))
    .mutation(
      async ({
        input: { categoryId: id, image },
        ctx: { prisma, session, logger },
      }) => {
        const existingCategory = await prisma.featuredCategory.findUnique({
          where: {
            categoryId: id,
          },
          select: {
            image: {
              select: {
                publicId: true,
              },
            },
            category: {
              select: {
                name: true,
                createdState: true,
              },
            },
          },
        });
        if (existingCategory === null) {
          return "Category not found";
        }

        await prisma.featuredCategory.update({
          where: {
            categoryId: id,
          },
          data: {
            image: {
              update: image,
            },
            updatedBy: {
              connect: {
                id: session.user.id,
              },
            },
          },
        });

        const error = await deleteImage(existingCategory.image.publicId);
        if (error) {
          await logger.error({
            message: "cannot able delete the old image in cloudinary",
            detail: JSON.stringify({
              procedure: "updateFeaturedCategoryById",
              message: "cannot able delete the old image in cloudinary",
              existingCategory,
              error,
            }),
            state: existingCategory.category.createdState,
          });
          return `Cannot able to delete the of the category ${existingCategory.category.name}'s Image` as const;
        }
        await logger.info({
          message: `'${session.user.name}' updated image of a featured category named '${existingCategory.category.name}'`,
          state: existingCategory.category.createdState,
        });
      },
    ),
});
