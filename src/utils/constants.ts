import { z } from "zod";

// functionality
export const defaultLimit = 30 as const;
export const maxLimit = 100 as const;
export const defaultSortOrder = "desc" as const;
export const defaultSearch = "" as const;
export const defaultSortBy = "createdAt" as const;
export type SortOrder = "asc" | "desc";
export type SortBy = "name" | "createdAt";

// headers labels
export const requestPathHeaderName = "x-forwarded-path" as const;
export const adminPageRegex = /\/admin\//g;
export const pathHeaderName = "x-pathname" as const;
export const deviceTypeHeaderName = "x-device-type" as const;

// image upload
export const maxImageCount = 5 as const;
export const imageFieldName = "images" as const;
export const maxImageSizeInMB = 10 as const;

// bid duration plans
export const plans = [7, 14, 30] as const;
export const plansSchema = z.union([
  z.literal(7),
  z.literal(14),
  z.literal(30),
]);
export type Plan = z.infer<typeof plansSchema>;
