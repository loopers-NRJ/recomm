import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";
import {
  adminProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { functionalityOptions, imageInputs } from "@/utils/validation";

export const categoryRouter = createTRPCRouter({
  getCategories: publicProcedure
    .input(functionalityOptions)
    .query(
      async ({ input: { search, page, limit, sortBy, sortOrder }, ctx }) => {
        try {
          const categories = await ctx.prisma.category.findMany({
            where: {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            skip: (page - 1) * limit,
            take: limit,
            orderBy: [
              {
                [sortBy]: sortOrder,
              },
            ],
            include: {
              image: true,
            },
          });
          return categories;
        } catch (error) {
          console.error({ procedure: "getCategories", error });
          return new Error("Failed to fetch categories");
        }
      }
    ),
  getCategoryById: publicProcedure
    .input(z.object({ categoryId: z.string().cuid() }))
    .query(async ({ input: { categoryId: id }, ctx }) => {
      try {
        const category = await ctx.prisma.category.findUnique({
          where: {
            id,
          },
          include: {
            image: true,
          },
        });
        if (category === null) {
          return new Error("Category does not exist");
        }
        return category;
      } catch (error) {
        console.error({ procedure: "getCategoryById", error });
        return new Error("Failed to fetch category");
      }
    }),
  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(3).max(255),
        image: imageInputs,
      })
    )
    .mutation(async ({ input: { name, image }, ctx }) => {
      try {
        // checking whether the category already exists
        const existingCategory = await ctx.prisma.category.findUnique({
          where: {
            name,
          },
          select: {
            name: true,
          },
        });
        if (existingCategory !== null) {
          return new Error(`Category with name: ${name} already exists`);
        }
        // creating the category
        const category = await ctx.prisma.category.create({
          data: {
            name,
            image: {
              create: image,
            },
          },
          include: {
            image: true,
          },
        });
        return category;
      } catch (error) {
        console.error({ procedure: "createCategory", error });
        return new Error(`Cannot create the category with name: ${name}`);
      }
    }),
  updateCategoryById: adminProcedure
    .input(
      z.union([
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255),
          image: imageInputs.optional(),
        }),
        z.object({
          id: z.string().cuid(),
          name: z.string().min(1).max(255).optional(),
          image: imageInputs,
        }),
      ])
    )
    .mutation(async ({ input: { id, name, image }, ctx }) => {
      try {
        // checking whether the category exists
        const existingCategory = await ctx.prisma.category.findUnique({
          where: {
            id,
          },
          select: {
            name: true,
            image: true,
          },
        });
        if (existingCategory === null) {
          return new Error("Category does not exist");
        }
        // checking whether the new name already exists
        if (name !== undefined && name !== existingCategory.name) {
          const existingCategory = await ctx.prisma.category.findFirst({
            where: {
              name: {
                equals: name,
                mode: "insensitive",
              },
            },
            select: {
              id: true,
            },
          });
          if (existingCategory !== null) {
            return new Error(`Category ${name} already exists`);
          }
        }

        const updatedCategory = await ctx.prisma.category.update({
          where: {
            id,
          },
          data: {
            name,
            image: {
              create: image,
            },
          },
          include: {
            image: true,
          },
        });
        // deleting the old image from cloudinary
        if (image !== undefined) {
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
      } catch (error) {
        console.error("Error in updateCategoryById procedure:", error);
        return new Error(`Cannot update the category with id: ${id}`);
      }
    }),
  deleteCategoryById: adminProcedure
    .input(z.object({ categoryId: z.string().cuid() }))
    .mutation(async ({ input: { categoryId: id }, ctx }) => {
      try {
        // checking whether the category exists
        const existingCategory = await ctx.prisma.category.findUnique({
          where: {
            id,
          },
          select: {
            image: true,
          },
        });
        if (existingCategory === null) {
          return new Error("Category does not exist");
        }
        // deleting the category
        const category = await ctx.prisma.category.delete({
          where: {
            id,
          },
        });

        // using void to not wait for the promise to resolve
        void ctx.prisma.categoryImage
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

        return category;
      } catch (error) {
        console.error({
          procedure: "deleteCategoryById",
          error,
        });
        return new Error(`Cannot delete category with id: ${id}`);
      }
    }),
});
