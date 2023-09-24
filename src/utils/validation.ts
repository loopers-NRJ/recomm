import { z } from "zod";

import {
  OptionTypeArray,
  QuestionTypeArray,
  OptionPayloadIncluded,
} from "@/types/prisma";
import { OptionType, ModelQuestion, QuestionType } from "@prisma/client";

import {
  DefaultLimit,
  DefaultPage,
  DefaultSortBy,
  DefaultSortOrder,
  MaxLimit,
} from "./constants";

export const functionalityOptions = z.object({
  search: z.string().default(""),
  limit: z.number().int().positive().max(MaxLimit).default(DefaultLimit),
  page: z.number().int().positive().default(DefaultPage),
  sortOrder: z.enum(["asc", "desc"]).default(DefaultSortOrder),
  sortBy: z.enum(["name", "createdAt"]).default(DefaultSortBy),
});

export const idSchema = z
  .string({
    required_error: "Enter an id",
  })
  .trim()
  .min(1, "Enter an id")
  .cuid({ message: "Invalid Id" });

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
    .trim()
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
    .trim()
    .min(10, "Please provide a description to your product"),
  images: z.array(imageInputs).nonempty("Upload at least one image"),
  categoryId: idSchema,
  brandId: idSchema,
  modelId: idSchema,
  closedAt: z
    .date()
    .default(() => new Date(Date.now() + 60 * 60 * 24 * 7))
    .refine((date) => date.getTime() > Date.now(), {
      message: "Date must be in the future",
    }),
  options: z
    .array(
      z.union([
        z.object({
          optionId: idSchema,
          type: z.enum([OptionType.Dropdown, OptionType.Variant]),
          valueId: idSchema.nonempty({ message: "Enter at least one value" }),
        }),
        z.object({
          optionId: idSchema,
          type: z.enum([OptionType.Checkbox]),
          valueIds: z
            .array(idSchema.nonempty({ message: "Enter at least one value" }))
            .nonempty({ message: "Enter at least one value" }),
        }),
      ])
    )
    .default([]),
  answers: z.array(
    z.object({
      questionId: idSchema,
      answer: z.string().trim().min(1, "Enter an answer"),
    })
  ),
});

export const modelSchema = z.object({
  name: z
    .string({
      required_error: "Enter a name",
    })
    .min(1, "Enter a name")
    .max(255, "Name must be less than 255 characters"),
  brandId: idSchema,
  categoryId: idSchema,
  options: z.array(
    z.object({
      name: z
        .string({
          required_error: "Enter an option",
        })
        .min(1, "Enter an option")
        .max(25, "Option must be less than 25 characters"),
      type: z.enum(OptionTypeArray),
      required: z.boolean().default(true),
      values: z
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
  questions: z.array(
    z.object({
      question: z
        .string({
          required_error: "Enter a question",
        })
        .trim()
        .min(1)
        .max(255),
      type: z.enum(QuestionTypeArray, {
        required_error: "Select a type",
        invalid_type_error: "Invalid type",
      }),
      required: z.boolean().default(true),
    })
  ),
  image: imageInputs.optional(),
});

type ProvidedVariantOption = z.infer<typeof productSchema>["options"][0];

export const validateOptionValues = (
  variantOptions: OptionPayloadIncluded[],
  providedVariantOptions: ProvidedVariantOption[]
) => {
  for (const option of variantOptions) {
    // check if the model option is provided
    const providedOption = providedVariantOptions.find(
      (providedVarientOption) => providedVarientOption.optionId === option.id
    );
    // if the model option is not provided and is required
    if (providedOption === undefined && option.required) {
      return { id: option.id, message: `Select Varient for ${option.name}` };
    }
    // if the model option is not provided and is not required
    if (providedOption === undefined) {
      continue;
    }
    // if the model option is provided and is a checkbox
    if (providedOption.type === OptionType.Checkbox) {
      // check if the provided option has at least one value
      const providedValues = option.values.filter((variantValue) =>
        providedOption.valueIds.includes(variantValue.id)
      );
      // if the provided option has no values
      if (providedValues.length === 0) {
        return { id: option.id, message: `Select Varient for ${option.name}` };
      }
    } else {
      // if the model option is provided and is a dropdown or variant
      // check if the provided option has a value
      const providedValue = option.values.find(
        (variantValue) => variantValue.id === providedOption.valueId
      );
      // if the provided option has no value
      if (!providedValue) {
        return { id: option.id, message: `Select Varient for ${option.name}` };
      }
    }
  }
  return true;
};

export const validateQuestionAnswers = (
  questions: ModelQuestion[],
  providedAnswers: z.infer<typeof productSchema>["answers"]
) => {
  for (const question of questions) {
    // check if the model question is provided
    const providedAnswer = providedAnswers.find(
      (providedAnswer) => providedAnswer.questionId === question.id
    );
    // if the model question is not provided and is required
    if (providedAnswer === undefined && question.required) {
      return {
        id: question.id,
        message: `Answer Question for ${question.question}`,
      };
    }
    // if the model question is not provided and is not required
    if (providedAnswer === undefined) {
      continue;
    }
    if (!isValidType(question.type, providedAnswer.answer)) {
      return {
        id: question.id,
        message: `Invalid type for ${question.question}`,
      };
    }
  }
  return true;
};

export const isValidType = (type: QuestionType, value: string) => {
  switch (type) {
    case QuestionType.Text:
    case QuestionType.Paragraph:
      return typeof value === "string" && value.trim().length > 0;
    case QuestionType.Number:
      return !isNaN(Number(value));
    case QuestionType.Date:
      return !isNaN(Date.parse(value));
    default:
      const _exhaustiveCheck: never = type;
      return _exhaustiveCheck;
  }
};
