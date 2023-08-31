import { z } from "zod";

export const functionalityOptions = z.object({
  search: z.string().default(""),
  limit: z.number().int().positive().max(100).default(30),
  page: z.number().int().positive().default(1),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(["name", "createdAt"]).default("createdAt"),
});
