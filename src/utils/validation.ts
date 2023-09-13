import { z } from "zod";

export const DefaultPage = 1;
export const DefaultLimit = 30;
export const MaxLimit = 100;
export const DefaultSortOrder = "desc";
export const DefaultSearch = "";
export const DefaultSortBy = "createdAt";
export type SortOrder = "asc" | "desc";
export type SortBy = "name" | "createdAt";

export const functionalityOptions = z.object({
  search: z.string().default(""),
  limit: z.number().int().positive().max(MaxLimit).default(DefaultLimit),
  page: z.number().int().positive().default(DefaultLimit),
  sortOrder: z.enum(["asc", "desc"]).default(DefaultSortOrder),
  sortBy: z.enum(["name", "createdAt"]).default(DefaultSortBy),
});

export const imageInputs = z.object({
  publicId: z.string(),
  url: z.string().url(),
  fileType: z.string(),
  width: z.number().int(),
  height: z.number().int(),
});

export type Image = z.infer<typeof imageInputs>;
