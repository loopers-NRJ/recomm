import { AccessType, CouponType } from "@prisma/client";
import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import {
  DEFAULT_LIMIT,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_ORDER,
  MAXIMUM_LIMIT,
} from "@/utils/constants";
import { couponCodeSchema, idSchema } from "@/utils/validation";

export const couponRouter = createTRPCRouter({
  all: getProcedure((accesses) =>
    accesses.some(
      (access) =>
        access === AccessType.createCoupon ||
        access === AccessType.updateCoupon ||
        access === AccessType.deleteCoupon,
    ),
  )
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
            "code",
            "discount",
            "type",
            "active",
            "city",
            "createdAt",
            "updatedAt",
          ])
          .default(DEFAULT_SORT_BY),
        cursor: z
          .object({ code: z.string().trim().min(1), categoryId: idSchema })
          .optional(),
        categoryId: idSchema,
      }),
    )
    .query(async ({ input, ctx: { prisma } }) => {
      const coupons = await prisma.coupon.findMany({
        where: {
          code: { contains: input.search },
          category: { id: input.categoryId },
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        take: input.limit,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : undefined,
      });
      return {
        coupons,
        nextCursor: coupons[input.limit - 1]
          ? {
              code: coupons[input.limit - 1]!.code,
              categoryId: coupons[input.limit - 1]!.categoryId,
            }
          : undefined,
      };
    }),
  validate: publicProcedure
    .input(z.object({ code: couponCodeSchema, categoryId: idSchema }))
    .mutation(async ({ input, ctx: { prisma } }) => {
      const coupon = await prisma.coupon.findUnique({
        where: { id: input },
      });
      return coupon;
    }),
  byId: getProcedure((accesses) =>
    accesses.some(
      (access) =>
        access === AccessType.createCoupon ||
        access === AccessType.updateCoupon ||
        access === AccessType.deleteCoupon,
    ),
  )
    .input(z.object({ code: couponCodeSchema, categoryId: idSchema }))
    .query(async ({ input, ctx: { prisma } }) => {
      const coupon = await prisma.coupon.findUnique({
        where: { id: input },
      });
      if (!coupon) {
        return "Coupon not found";
      }
      return coupon;
    }),
  create: getProcedure(AccessType.createCoupon)
    .input(
      z.union([
        z.object({
          code: couponCodeSchema,
          type: z.enum([CouponType.fixed]),
          discount: z.number().int().min(0),
          categoryId: idSchema,
        }),
        z.object({
          code: couponCodeSchema,
          type: z.enum([CouponType.percentage]),
          discount: z.number().int().min(0).max(100),
          categoryId: idSchema,
        }),
      ]),
    )
    .mutation(async ({ input, ctx: { prisma, session, logger } }) => {
      const category = await prisma.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        return "Category not found";
      }

      const coupon = await prisma.coupon.create({
        data: {
          code: input.code,
          type: input.type,
          discount: input.discount,
          createdBy: { connect: { id: session.user.id } },
          category: { connect: { id: category.id } },
        },
      });
      await logger.info({
        city: category.cityValue,
        message: `${session.user.name} created coupon ${coupon.code} with discount ${coupon.discount} for the category ${category.name}`,
      });
      return coupon;
    }),
  update: getProcedure(AccessType.updateCoupon)
    .input(
      z.object({
        categoryId: idSchema,
        code: couponCodeSchema,
        type: z.enum([CouponType.fixed, CouponType.percentage]).optional(),
        discount: z.number().int().min(0).optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(
      async ({
        input: { code, categoryId, ...input },
        ctx: { prisma, session, logger },
      }) => {
        const coupon = await prisma.coupon.findUnique({
          where: { id: { code, categoryId } },
        });
        if (!coupon) {
          return "Coupon not found";
        }

        const updatedCoupon = await prisma.coupon.update({
          where: { id: { code, categoryId } },
          data: {
            ...input,
            updatedBy: { connect: { id: session.user.id } },
          },
          include: {
            category: true,
          },
        });

        await logger.info({
          city: updatedCoupon.category?.cityValue ?? "common",
          message: `${session.user.name} updated coupon ${updatedCoupon.code}`,
        });

        return updatedCoupon;
      },
    ),
  delete: getProcedure(AccessType.deleteCoupon)
    .input(z.object({ code: couponCodeSchema, categoryId: idSchema }))
    .mutation(async ({ input, ctx: { prisma, session, logger } }) => {
      const coupon = await prisma.coupon.findUnique({
        where: { id: input },
        include: { category: true },
      });
      if (!coupon) {
        return "Coupon not found";
      }
      await prisma.coupon.delete({ where: { id: input } });
      await logger.info({
        city: coupon.category?.cityValue ?? "common",
        message: `${session.user.name} deleted coupon ${coupon.code}`,
      });
    }),
});
