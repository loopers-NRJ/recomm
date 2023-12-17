import slugify from "@/lib/slugify";
import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import {
  createTRPCRouter,
  getProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  DefaultLimit,
  DefaultSortBy,
  DefaultSortOrder,
  MaxFeaturedCategory,
  MaxLimit,
} from "@/utils/constants";
import { idSchema, imageInputs } from "@/utils/validation";
import { AccessType } from "@prisma/client";
import {
  CategoryPayload,
  FeaturedCategoryPayload,
  states,
} from "@/types/prisma";

export const categoryRouter = createTRPCRouter({
  getCategories: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(MaxLimit).default(DefaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(DefaultSortOrder),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt", "active", "featured"])
          .default(DefaultSortBy),
        cursor: idSchema.optional(),
        parentId: idSchema.nullish(),
        parentSlug: z.string().min(1).max(255).nullish(),
        state: z.enum(states),
      })
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
      }
    ),

  getCategoriesWithoutPayload: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(MaxLimit).default(DefaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(DefaultSortOrder),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt", "active", "featured"])
          .default(DefaultSortBy),
        cursor: idSchema.optional(),
        parentId: idSchema.nullish(),
        parentSlug: z.string().min(1).max(255).nullish(),
        state: z.enum(states),
      })
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
      }
    ),
  getCategoryById: publicProcedure
    .input(z.object({ categoryId: idSchema.nullish() }))
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
        throw new Error("Category does not exist");
      }
      return category;
    }),
  getCategoryBySlug: publicProcedure
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
        throw new Error("Category does not exist");
      }
      return category;
    }),

  createCategory: getProcedure(AccessType.createCategory)
    .input(
      z.object({
        name: z.string().min(3).max(255),
        parentCategoryId: idSchema.optional(),
        state: z.enum(states),
      })
    )
    .mutation(
      async ({
        input: { name, parentCategoryId, state },
        ctx: { prisma, session },
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
          throw new Error(`Category with name: ${name} already exists`);
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
        return category;
      }
    ),
  updateCategoryById: getProcedure(AccessType.updateCategory)
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
      ])
    )
    .mutation(
      async ({
        input: { id, name, parentCategoryId, active },
        ctx: { prisma },
      }) => {
        // checking whether the category exists
        const existingCategory = await prisma.category.findUnique({
          where: {
            id,
          },
          select: {
            name: true,
            createdState: true,
          },
        });
        if (existingCategory === null) {
          throw new Error("Category does not exist");
        }
        // checking whether the new name already exists
        if (name !== undefined && name !== existingCategory.name) {
          const existingName = await prisma.category.findFirst({
            where: {
              name: {
                equals: name,
              },
              createdState: existingCategory.createdState,
            },
            select: {
              id: true,
            },
          });
          if (existingName !== null) {
            throw new Error(`Category ${name} already exists`);
          }
        }

        const updatedCategory = await prisma.category.update({
          where: {
            id,
          },
          data: {
            name,
            slug: name ? slugify(name) : undefined,
            parentCategory: parentCategoryId
              ? {
                  connect: {
                    id: parentCategoryId,
                  },
                }
              : undefined,
            active,
          },
          include: CategoryPayload.include,
        });
        return updatedCategory;
      }
    ),
  deleteCategoryById: getProcedure(AccessType.deleteCategory)
    .input(z.object({ categoryId: idSchema }))
    .mutation(async ({ input: { categoryId: id }, ctx: { prisma } }) => {
      // checking whether the category exists
      const existingCategory = await prisma.category.findUnique({
        where: {
          id,
        },
      });
      if (existingCategory === null) {
        throw new Error("Category does not exist");
      }
      // deleting the category
      const category = await prisma.category.delete({
        where: {
          id,
        },
      });
      return category;
    }),
  getFeaturedCategories: publicProcedure
    .input(
      z.object({
        search: z.string().trim().default(""),
        limit: z.number().int().positive().max(MaxLimit).default(DefaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(DefaultSortOrder),
        sortBy: z
          .enum(["name", "createdAt", "updatedAt", "active"])
          .default(DefaultSortBy),
        cursor: idSchema.optional(),
        state: z.enum(states),
      })
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
      }
    ),

  makeCategoryFeaturedById: getProcedure(AccessType.updateCategory)
    .input(z.object({ categoryId: idSchema, image: imageInputs }))
    .mutation(
      async ({
        input: { categoryId: id, image },
        ctx: { prisma, session },
      }) => {
        const totalFeaturedCategories = await prisma.featuredCategory.count();
        if (totalFeaturedCategories >= MaxFeaturedCategory) {
          throw new Error(
            `Cannot make the category as featured. Maximum featured category limit reached`
          );
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
        return data.category;
      }
    ),
  removeCategoryFromFeaturedById: getProcedure(AccessType.updateCategory)
    .input(z.object({ categoryId: idSchema }))
    .mutation(async ({ input: { categoryId: id }, ctx: { prisma } }) => {
      const existingCategory = await prisma.featuredCategory.findUnique({
        where: {
          categoryId: id,
        },
        include: {
          image: true,
        },
      });
      if (existingCategory === null) {
        throw new Error("Category does not exist");
      }
      await prisma.featuredCategory.delete({
        where: {
          categoryId: id,
        },
      });

      const error = await deleteImage(existingCategory.image.publicId);
      if (error) {
        console.error({
          procedure: "removeCategoryFromFeaturedById",
          message: "cannot able delete the old image in cloudinary",
          existingCategory,
          error,
        });
        throw new Error("Cannot able to delete the old image");
      }
    }),

  updateFeaturedCategoryById: getProcedure(AccessType.updateCategory)
    .input(z.object({ categoryId: idSchema, image: imageInputs }))
    .mutation(async ({ input: { categoryId: id, image }, ctx: { prisma } }) => {
      const existingCategory = await prisma.featuredCategory.findUnique({
        where: {
          categoryId: id,
        },
        include: {
          image: true,
        },
      });
      if (existingCategory === null) {
        throw new Error("Category does not exist");
      }

      await prisma.featuredCategory.update({
        where: {
          categoryId: id,
        },
        data: {
          image: {
            update: image,
          },
        },
      });

      const error = await deleteImage(existingCategory.image.publicId);
      if (error) {
        console.error({
          procedure: "updateFeaturedCategoryById",
          message: "cannot able delete the old image in cloudinary",
          existingCategory,
          error,
        });
        throw new Error("Cannot able to delete the old image");
      }
    }),
});
