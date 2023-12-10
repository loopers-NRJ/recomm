import { z } from "zod";

import {
  MultipleChoiceQuestionPayloadIncluded,
  MultipleChoiceQuestionTypeArray,
  AtomicQuestionTypeArray,
} from "@/types/prisma";
import {
  AtomicQuestion,
  MultipleChoiceQuestionType,
  AtomicQuestionType,
} from "@prisma/client";

import {
  DefaultLimit,
  DefaultSortBy,
  DefaultSortOrder,
  MaxLimit,
} from "./constants";

export const idSchema = z
  .string({
    required_error: "Enter an id",
  })
  .trim()
  .min(1, "Enter an id")
  .cuid({ message: "Invalid Id" });

export const functionalityOptions = z.object({
  search: z.string().trim().default(""),
  limit: z.number().int().positive().max(MaxLimit).default(DefaultLimit),
  sortOrder: z.enum(["asc", "desc"]).default(DefaultSortOrder),
  sortBy: z.enum(["name", "createdAt"]).default(DefaultSortBy),
  cursor: idSchema.optional(),
});

export const imageInputs = z.object({
  publicId: z.string().trim(),
  url: z.string().url(),
  fileType: z.string().trim(),
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
  multipleChoiceAnswers: z
    .array(
      z.union([
        z.object({
          questionId: idSchema,
          type: z.enum([
            MultipleChoiceQuestionType.Dropdown,
            MultipleChoiceQuestionType.Variant,
            MultipleChoiceQuestionType.RadioGroup,
          ]),
          valueId: idSchema.nonempty({ message: "Enter at least one value" }),
        }),
        z.object({
          questionId: idSchema,
          type: z.enum([MultipleChoiceQuestionType.Checkbox]),
          valueIds: z
            .array(idSchema.nonempty({ message: "Enter at least one value" }))
            .nonempty({ message: "Enter at least one value" }),
        }),
      ])
    )
    .default([]),
  atomicAnswers: z.array(
    z.union([
      z.object({
        questionId: idSchema,
        type: z.enum([AtomicQuestionType.Text, AtomicQuestionType.Paragraph]),
        answerContent: z.string().trim().min(1, "Enter an answer"),
      }),
      z.object({
        questionId: idSchema,
        type: z.enum([AtomicQuestionType.Number]),
        answerContent: z.number().min(1, "Enter an answer"),
      }),
      z.object({
        questionId: idSchema,
        type: z.enum([AtomicQuestionType.Date]),
        answerContent: z
          .date({
            required_error: "Enter an answer",
            invalid_type_error: "Invalid date",
          })
          .refine((date) => date.getTime() > Date.now(), {
            message: "Date must be in the future",
          }),
      }),
    ])
  ),
});

export const modelSchema = z.object({
  name: z
    .string({
      required_error: "Enter a name",
    })
    .trim()
    .min(1, "Enter a name")
    .max(255, "Name must be less than 255 characters"),
  brandId: idSchema,
  categoryId: idSchema,
  multipleChoiceQuestions: z.array(
    z.object({
      questionContent: z
        .string({
          required_error: "Enter the question",
        })
        .trim()
        .min(1, "Question cannot be empty")
        .max(255, "Coice must be less than 255 characters"),
      type: z.enum(MultipleChoiceQuestionTypeArray, {
        required_error: "Type is required for a question",
        invalid_type_error: "Invalid Question type",
      }),
      required: z.boolean().default(true),
      choices: z
        .array(
          z
            .string({
              required_error: "Enter a value",
            })
            .trim()
            .min(1, "Choice cannot be empty")
            .max(255, "Choice must be less than 255 characters")
        )
        .nonempty({ message: "Enter at least one choice" }),
    })
  ),
  atomicQuestions: z.array(
    z.object({
      questionContent: z
        .string({
          required_error: "Enter a question",
        })
        .trim()
        .min(1, "Question cannot be empty")
        .max(255, "Question must be less than 255 characters"),
      type: z.enum(AtomicQuestionTypeArray, {
        required_error: "Select a type for the question",
        invalid_type_error: "Invalid Question type",
      }),
      required: z.boolean().default(true),
    })
  ),
  image: imageInputs.optional(),
});

type ProvidedMultipleChoiceQuestionAnswer = z.infer<
  typeof productSchema
>["multipleChoiceAnswers"][0];

export const validateMultipleChoiceQuestionInput = (
  multipleChoiceQuestions: MultipleChoiceQuestionPayloadIncluded[],
  providedChoices: ProvidedMultipleChoiceQuestionAnswer[]
) => {
  for (const question of multipleChoiceQuestions) {
    // check if the model question is provided
    const providedChoice = providedChoices.find(
      (providedVarientOption) =>
        providedVarientOption.questionId === question.id
    );
    // if the model question is not provided and is required
    if (providedChoice === undefined && question.required) {
      return {
        id: question.id,
        message: `Select Varient for ${question.questionContent}`,
      };
    }
    // if the model question is not provided and is not required
    if (providedChoice === undefined) {
      continue;
    }
    // if the model question is provided and is a checkbox
    if (providedChoice.type === MultipleChoiceQuestionType.Checkbox) {
      // check if the provided question has at least one value
      const providedValues = question.choices.filter((choice) =>
        providedChoice.valueIds.includes(choice.id)
      );
      // if the provided answer has no values
      if (providedValues.length === 0) {
        return {
          id: question.id,
          message: `Select Varient for ${question.questionContent}`,
        };
      }
    } else {
      // if the model question is provided and it is not a checkbox
      // check if the provided answer has a value
      const providedValue = question.choices.find(
        (choice) => choice.id === providedChoice.valueId
      );
      // if the provided answer has no value
      if (!providedValue) {
        return {
          id: question.id,
          message: `Select Varient for ${question.questionContent}`,
        };
      }
    }
  }
  return true;
};

export const validateAtomicQuestionAnswers = (
  questions: AtomicQuestion[],
  providedAnswers: z.infer<typeof productSchema>["atomicAnswers"]
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
        message: `Answer Question for ${question.questionContent}`,
      };
    }
    // if the model question is not provided and is not required
    if (providedAnswer === undefined) {
      continue;
    }
  }
  return true;
};
