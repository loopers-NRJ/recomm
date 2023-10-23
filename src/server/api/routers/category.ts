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
      })
    )
    .query(
      async ({
        input: { search, limit, sortBy, sortOrder, parentId, cursor },
        ctx: { prisma, isAdmin },
      }) => {
        const categories = await prisma.category.findMany({
          where: {
            name: {
              contains: search,
            },
            active: isAdmin ? undefined : true,
            parentCategoryId: parentId,
          },
          cursor: cursor
            ? {
                id: cursor,
              }
            : undefined,

          take: limit,
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
          previousCursor: cursor,
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
          image: true,
          featuredCategory: true,
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
        image: imageInputs.optional(),
        parentCategoryId: idSchema.optional(),
      })
    )
    .mutation(
      async ({ input: { name, image, parentCategoryId }, ctx: { prisma } }) => {
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
            image: image
              ? {
                  create: image,
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
          image: imageInputs.optional(),
          parentCategoryId: idSchema.optional(),
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          image: imageInputs,
          parentCategoryId: idSchema.optional(),
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          image: imageInputs.optional(),
          parentCategoryId: idSchema,
          active: z.boolean().optional(),
        }),
        z.object({
          id: idSchema,
          name: z.string().min(1).max(255).optional(),
          image: imageInputs.optional(),
          parentCategoryId: idSchema.optional(),
          active: z.boolean(),
        }),
      ])
    )
    .mutation(
      async ({
        input: { id, name, image, parentCategoryId, active },
        ctx: { prisma },
      }) => {
        // checking whether the category exists
        const existingCategory = await prisma.category.findUnique({
          where: {
            id,
          },
          select: {
            name: true,
            image: true,
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
            image: {
              create: image,
            },
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
        // deleting the old image from cloudinary
        if (image !== undefined && existingCategory.image !== null) {
          const error = await deleteImage(existingCategory.image.publicId);
          if (error) {
            console.error({
              procedure: "updateCategoryById",
              message: "cannot able delete the old image in cloudinary",
              existingCategory,
              updatedCategory,
              error,
            });
          }
        }
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
        select: {
          image: true,
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
      if (existingCategory.image !== null) {
        // using void to not wait for the promise to resolve
        void prisma.image
          .delete({
            where: {
              id: existingCategory.image.id,
            },
          })
          .catch((error) => {
            console.error({
              procedure: "deleteCategoryById",
              message: "cannot able delete the old image in database",
              error,
            });
          });

        // using void to not wait for the promise to resolve
        void deleteImage(existingCategory.image.publicId)
          .then((error) => {
            if (error instanceof Error) {
              console.error({
                procedure: "deleteCategoryById",
                message: "cannot able delete the old image in database",
                error,
              });
            }
          })
          .catch((error) => {
            console.error({
              procedure: "deleteCategoryById",
              message: "cannot able delete the old image in database",
              error,
            });
          });
      }
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
          orderBy: [
            {
              category: {
                [sortBy]: sortOrder,
              },
            },
          ],
          include: {
            category: {
              include: {
                image: true,
              },
            },
          },
        });
        return {
          categories: categories.map(({ category }) => category),
          nextCursor: categories[limit - 1]?.categoryId,
          previousCursor: cursor,
        };
      }
    ),

  makeCategoryFeaturedById: getProcedure(AccessType.updateCategory)
    .input(z.object({ categoryId: idSchema }))
    .mutation(async ({ input: { categoryId: id }, ctx: { prisma } }) => {
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
      const data = await prisma.featuredCategory.delete({
        where: {
          categoryId: id,
        },
        select: {
          category: true,
        },
      });
      return data.category;
    }),
});
