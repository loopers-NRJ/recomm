import { AccessType, CouponType } from "@prisma/client";
import { createTRPCRouter, getProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import {
  defaultLimit,
  defaultSortBy,
  defaultSortOrder,
  maxLimit,
} from "@/utils/constants";
import { couponCodeSchema, idSchema } from "@/utils/validation";
import { states } from "@/types/prisma";
import { isAlphaNumeric } from "@/utils/functions";

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
        limit: z.number().int().positive().max(maxLimit).default(defaultLimit),
        sortOrder: z.enum(["asc", "desc"]).default(defaultSortOrder),
        sortBy: z
          .enum([
            "code",
            "discount",
            "type",
            "active",
            "state",
            "createdAt",
            "updatedAt",
          ])
          .default(defaultSortBy),
        cursor: idSchema.optional(),
        state: z.enum(states),
        categoryId: idSchema,
      }),
    )
    .query(async ({ input, ctx: { prisma } }) => {
      const coupons = await prisma.coupon.findMany({
        where: {
          code: { contains: input.search },
          state: input.state,
          category: { createdState: input.state, id: input.categoryId },
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        take: input.limit,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        skip: input.cursor ? 1 : undefined,
      });
      return {
        coupons,
        nextCursor: coupons[input.limit - 1]?.id,
      };
    }),
  validate: publicProcedure
    .input(z.object({ code: couponCodeSchema }))
    .mutation(async ({ input: { code }, ctx: { prisma } }) => {
      const coupon = await prisma.coupon.findUnique({
        where: { code },
      });
      return !!coupon;
    }),
  byId: getProcedure((accesses) =>
    accesses.some(
      (access) =>
        access === AccessType.createCoupon ||
        access === AccessType.updateCoupon ||
        access === AccessType.deleteCoupon,
    ),
  )
    .input(z.object({ id: idSchema }))
    .query(async ({ input: { id }, ctx: { prisma } }) => {
      const coupon = await prisma.coupon.findUnique({
        where: { id },
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
          code: z
            .string()
            .trim()
            .min(4)
            .max(16)
            .refine(isAlphaNumeric, { message: "Invalid coupon code" }),
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
          state: category.createdState,
          createdBy: { connect: { id: session.user.id } },
          category: { connect: { id: category.id } },
        },
      });
      await logger.info({
        state: category.createdState,
        message: `${session.user.name} created coupon ${coupon.code} with discount ${coupon.discount} for the category`,
      });
      return coupon;
    }),
  update: getProcedure(AccessType.updateCoupon)
    .input(
      z.object({
        id: idSchema,
        code: couponCodeSchema.optional(),
        type: z.enum([CouponType.fixed, CouponType.percentage]).optional(),
        discount: z.number().int().min(0).optional(),
        state: z.enum(states).optional(),
        active: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx: { prisma, session, logger } }) => {
      const coupon = await prisma.coupon.findUnique({
        where: { id: input.id },
      });
      if (!coupon) {
        return "Coupon not found";
      }
      if (input.code) {
        const existingCoupon = await prisma.coupon.findUnique({
          where: { code: input.code },
        });
        if (existingCoupon) {
          return "Coupon code already exists";
        }
      }

      const updatedCoupon = await prisma.coupon.update({
        where: { id: input.id },
        data: {
          ...input,
          updatedBy: { connect: { id: session.user.id } },
        },
      });
      if (input.code) {
        await logger.info({
          state: updatedCoupon.state,
          message: `${session.user.name} updated coupon code from ${
            coupon.code
          } to ${updatedCoupon.code} with discount ${updatedCoupon.discount}${
            updatedCoupon.type === CouponType.percentage ? "%" : "RS"
          }`,
        });
      } else {
        await logger.info({
          state: updatedCoupon.state,
          message: `${session.user.name} updated coupon ${
            updatedCoupon.code
          } with discount ${updatedCoupon.discount}${
            updatedCoupon.type === CouponType.percentage ? "%" : "RS"
          }`,
        });
      }

      return updatedCoupon;
    }),
  delete: getProcedure(AccessType.deleteCoupon)
    .input(z.object({ couponId: idSchema }))
    .mutation(
      async ({ input: { couponId }, ctx: { prisma, session, logger } }) => {
        const coupon = await prisma.coupon.findUnique({
          where: { id: couponId },
        });
        if (!coupon) {
          return "Coupon not found";
        }
        await prisma.coupon.delete({ where: { id: couponId } });
        await logger.info({
          state: coupon.state,
          message: `${session.user.name} deleted coupon ${coupon.code}`,
        });
      },
    ),
});
