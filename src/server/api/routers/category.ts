import slugify from "slugify";
import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import {
  createTRPCRouter,
  getProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { MaxFeaturedCategory } from "@/utils/constants";
import {
  functionalityOptions,
  idSchema,
  imageInputs,
} from "@/utils/validation";
import { AccessType } from "@prisma/client";
import { CategoryPayload } from "@/types/prisma";

export const categoryRouter = createTRPCRouter({
  getCategories: publicProcedure
    .input(
      functionalityOptions.extend({
        parentId: idSchema.nullish(),
        parentSlug: z.string().min(1).max(255).nullish(),
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
        },
        ctx: { prisma, isAdmin },
      }) => {
        const categories = await prisma.category.findMany({
          where: {
            name: {
              contains: search,
            },
            active: isAdmin ? undefined : true,
            parentCategoryId: parentId,
            parentCategory: parentSlug
              ? {
                  slug: parentSlug,
                }
              : undefined,
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
          include: CategoryPayload.include,
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
      })
    )
    .mutation(
      async ({ input: { name, parentCategoryId }, ctx: { prisma } }) => {
        // checking whether the category already exists
        const existingCategory = await prisma.category.findUnique({
          where: {
            name,
            parentCategoryId,
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
          },
        });
        if (existingCategory === null) {
          throw new Error("Category does not exist");
        }
        // checking whether the new name already exists
        if (name !== undefined && name !== existingCategory.name) {
          const existingCategory = await prisma.category.findFirst({
            where: {
              name: {
                equals: name,
              },
            },
            select: {
              id: true,
            },
          });
          if (existingCategory !== null) {
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
    .input(functionalityOptions)
    .query(
      async ({
        input: { search, limit, sortBy, sortOrder, cursor },
        ctx: { prisma, isAdmin },
      }) => {
        const categories = await prisma.featuredCategory.findMany({
          where: {
            category: {
              name: {
                contains: search,
              },
              active: isAdmin ? undefined : true,
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
          include: {
            category: true,
            image: true,
          },
        });
        return {
          categories: categories.map(({ category }) => category),
          nextCursor: categories[limit - 1]?.categoryId,
        };
      }
    ),

  makeCategoryFeaturedById: getProcedure(AccessType.updateCategory)
    .input(z.object({ categoryId: idSchema, image: imageInputs }))
    .mutation(async ({ input: { categoryId: id, image }, ctx: { prisma } }) => {
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
        },
        select: {
          category: true,
        },
      });
      return data.category;
    }),
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
});
