import { states } from "@/types/prisma";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod";
import { addressSchema, idSchema } from "@/utils/validation";

export const addressRouter = createTRPCRouter({
  all: protectedProcedure.query(async ({ ctx: { prisma, session } }) => {
    const address = await prisma.address.findMany({
      where: {
        userId: session.user.id,
      },
    });
    return address;
  }),
  byId: publicProcedure
    .input(z.object({ id: idSchema }))
    .query(async ({ ctx: { prisma }, input }) => {
      const address = await prisma.address.findUnique({
        where: {
          id: input.id,
        },
      });
      return address;
    }),
  byTag: protectedProcedure
    .input(z.object({ tag: z.string() }))
    .query(async ({ ctx: { prisma, session }, input }) => {
      const address = await prisma.address.findMany({
        where: {
          userId: session.user.id,
          tag: input.tag,
        },
      });
      return address;
    }),
  create: protectedProcedure
    .input(addressSchema)
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      const count = await prisma.address.count({
        where: {
          userId: session.user.id,
        },
      });
      const maxAddressCount = await prisma.appConfiguration.findUnique({
        where: {
          key: "maximumAddressPerUser",
        },
        select: {
          value: true,
        },
      });
      if (!maxAddressCount?.value || isNaN(Number(maxAddressCount?.value))) {
        return "Invalid Max Address Count" as const;
      }
      if (count > Number(maxAddressCount.value)) {
        return "You can't add more than 5 addresses" as const;
      }

      const address = await prisma.address.create({
        data: {
          ...input,
          userId: session.user.id,
        },
      });
      return address;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: idSchema,
        tag: z.string().optional(),
        addressLine: z.string().optional(),
        city: z.string().optional(),
        state: z.enum(states).optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      const address = await prisma.address.update({
        where: {
          id: input.id,
          userId: session.user.id,
        },
        data: {
          ...input,
        },
      });
      return address;
    }),
  delete: protectedProcedure
    .input(z.object({ id: idSchema }))
    .mutation(async ({ ctx: { prisma, session }, input }) => {
      const products = await prisma.product.findMany({
        where: {
          addressId: input.id,
        }
      });
      if (products.length > 0) {
        return "You can't delete an address that is being used by a product" as const;
      }
      const address = await prisma.address.delete({
        where: {
          id: input.id,
          userId: session.user.id,
        },
      });
      return address;
    }),
});
