import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { idSchema } from "@/utils/validation";
import { env } from "@/env";
import { prisma } from "@/server/db";

export const cityRouter = createTRPCRouter({
  all: protectedProcedure.query(({ ctx: { prisma } }) => {
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
        return "Something went wrong";
      }
      const result = responseSchema.safeParse(await response.json());
      if (!result.success) {
        return "Something went wrong";
      }
      const apiResponse = result.data;
      let cityName = apiResponse.city;
      if (!apiResponse.city) {
        cityName = apiResponse.state_district.split(" ")[0];
      }

      const city = await prisma.city.findUnique({
        where: {
          value: cityName,
        },
      });
      if (!city) {
        return "Something went wrong";
      }
      return city;
    }),
});

const responseSchema = z.object({
  name: z.string(),
  country: z.string(),
  state: z.string(),
  state_district: z.string(),
  county: z.string(),
  city: z.string().optional(),
  postcode: z.string(),
  district: z.string(),
  lon: z.number(),
  lat: z.number(),
});
