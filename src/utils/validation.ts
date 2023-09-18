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
  page: z.number().int().positive().default(DefaultPage),
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

export const productSchema = z.object({
  price: z
    .number({
      required_error: "Enter a price",
      invalid_type_error: "Price must be a number",
    })
    .int("Price cannot have decimal values")
    .positive("Price must not be negative"),
  description: z
    .string({
      required_error: "Enter a description",
    })
    .min(10, "Please provide a description to your product"),
  modelId: z.string({
    required_error: "Select a model",
  }),
  brandId: z.string({
    required_error: "Select a brand",
  }),
  categoryId: z.string({
    required_error: "Select a category",
  }),
  images: z.array(z.any()).nonempty("Upload at least one image"),
  closedAt: z
    .date()
    .default(() => new Date(Date.now() + 60 * 60 * 24 * 7))
    .refine((date) => date.getTime() > Date.now(), {
      message: "Date must be in the future",
      params: {},
    }),
});

export type Image = z.infer<typeof imageInputs>;
