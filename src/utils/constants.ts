import { z } from "zod";

// functionality
export const DEFAULT_LIMIT = 30 as const;
export const MAXIMUM_LIMIT = 100 as const;
export const DEFAULT_SORT_ORDER = "desc" as const;
export const DEFAULT_SORT_BY = "createdAt" as const;

export type SortOrder = "asc" | "desc";

// headers labels
export const ADMIN_PAGE_REGEX = /^\/admin\//g;
export const PATH_HEADER_NAME = "X-Forwarded-Path" as const;
export const DEVICE_TYPE_HEADER_NAME = "x-device-type" as const;
export const DEVICE_OS_HEADER_NAME = "x-device-os" as const;

// image upload
export const MAXIMUM_IMAGE_COUNT = 5 as const;
export const IMAGE_FIELD_NAME = "images" as const;
export const MAXIMUM_IMAGE_SIZE_IN_MB = 10 as const;

// bid duration plans
export const plans = [7, 14, 30] as const;
export const plansSchema = z.union([
  z.literal(7),
  z.literal(14),
  z.literal(30),
]);
export type Plan = z.infer<typeof plansSchema>;
