import { z } from "zod";

import { VariantOption } from "@/types/prisma";

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

export type Image = z.infer<typeof imageInputs>;

export const productSchema = z.object({
  title: z
    .string({
      required_error: "Enter a title",
    })
    .min(1, "Please provide a title to your product"),
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
    .min(1, "Please provide a description to your product"),
  images: z.array(imageInputs).nonempty("Upload at least one image"),
  categoryId: z.string({
    required_error: "Select a category",
  }),
  brandId: z.string({
    required_error: "Select a brand",
  }),
  modelId: z.string({
    required_error: "Select a model",
  }),
  closedAt: z
    .date()
    .default(() => new Date(Date.now() + 60 * 60 * 24 * 7))
    .refine((date) => date.getTime() > Date.now(), {
      message: "Date must be in the future",
      params: {},
    }),
  variantOptions: z
    .array(
      z.object({
        optionId: z
          .string({
            required_error: "Select an option for all variants",
          })
          .cuid(),
        valueId: z
          .string({
            required_error: "Select an option for all variants",
          })
          .cuid()
          .nonempty({ message: "Enter at least one value" }),
      })
    )
    .default([]),
});

export const ModelSchema = z.object({
  name: z
    .string({
      required_error: "Enter a name",
    })
    .min(1, "Enter a name")
    .max(255, "Name must be less than 255 characters"),
  brandId: z.string({ required_error: "Select a brand" }).cuid(),
  categoryId: z
    .string({
      required_error: "Select a category",
    })
    .cuid(),
  variantOptions: z.array(
    z.object({
      name: z
        .string({
          required_error: "Enter an option",
        })
        .min(1, "Enter an option")
        .max(25, "Option must be less than 25 characters"),
      variantValues: z
        .array(
          z
            .string({
              required_error: "Enter a value",
            })
            .min(1, "Enter a value")
            .max(25, "Value must be less than 25 characters")
        )
        .nonempty({ message: "Enter at least one value" }),
    })
  ),
  image: imageInputs.optional(),
});

type ProvidedVariantOption = z.infer<typeof productSchema>["variantOptions"][0];

export const validateVariant = (
  variantOptions: VariantOption[],
  providedVariantOptions: ProvidedVariantOption[]
) => {
  for (const option of variantOptions) {
    // check if the model varient option is provided
    const providedOption = providedVariantOptions.find(
      (providedVarientOption) => providedVarientOption.optionId === option.id
    );
    if (!providedOption) {
      return { id: option.id, message: `Select Varient for ${option.name}` };
    }
    // check if the value for the varient option is provided
    const providedValue = option.variantValues.find(
      (variantValue) => variantValue.id === providedOption.valueId
    );
    if (!providedValue) {
      return { id: option.id, message: `Select Varient for ${option.name}` };
    }
  }
  return true;
};
