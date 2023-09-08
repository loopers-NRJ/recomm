import { z } from "zod";

export const functionalityOptions = z.object({
  search: z.string().default(""),
  limit: z.number().int().positive().max(100).default(30),
  page: z.number().int().positive().default(1),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
});

export const imageInputs = z.object({
  publicId: z.string(),
  url: z.string().url(),
  fileType: z.string(),
  width: z.number().int(),
  height: z.number().int(),
});
