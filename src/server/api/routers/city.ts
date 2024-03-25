import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { idSchema } from "@/utils/validation";
import { env } from "@/env";
import { prisma } from "@/server/db";

export const cityRouter = createTRPCRouter({
  all: publicProcedure.query(({ ctx: { prisma } }) => {
    return prisma.city.findMany();
  }),

  byRoleId: protectedProcedure
    .input(z.object({ roleId: idSchema }))
    .query(({ input: { roleId }, ctx: { prisma } }) => {
      return prisma.city.findMany({
        where: {
          roles: {
            some: {
              id: roleId,
            },
          },
        },
      });
    }),

  mapFromCoordinates: publicProcedure
    .input(z.object({ latitude: z.number(), longitude: z.number() }))
    .mutation(async ({ input: { latitude, longitude } }) => {
      const geocodeApiUrl = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${env.GEOCODE_API_KEY}`;
      const response = await fetch(geocodeApiUrl);
      if (!response.ok) {
        return "Failed to fetch data"
      }
      const result = responseSchema.safeParse(await response.json());
      if (!result.success) {
        return "Invalid response"
      }
      const apiResponse = result.data;
      const cityName = apiResponse.results[0]?.city;
      const city = await prisma.city.findUnique({
        where: {
          value: cityName,
        },
      });
      if (!city) {
        return "City not found"
      }
      return city;
    }),
});

const responseSchema = z.object({
  results: z.array(z.object({
    country: z.string(),
    state: z.string(),
    county: z.string(),
    city: z.string().optional(),
    postcode: z.string(),
    lon: z.number(),
    lat: z.number(),
  })),
});
