import { type ZodIssue, z } from "zod";

import {
  type MultipleChoiceQuestionPayloadIncluded,
  multipleChoiceQuestionTypeArray,
  atomicQuestionTypeArray,
  states,
} from "@/types/prisma";
import {
  type AtomicQuestion,
  MultipleChoiceQuestionType,
  AtomicQuestionType,
} from "@prisma/client";
import { isAlphaNumeric } from "./functions";

export const idSchema = z
  .string({
    required_error: "Enter an id",
  })
  .trim()
  .cuid({ message: "Invalid Id" });

export const imageInputs = z.object({
  url: z.string().url(),
  publicId: z.string(),
  secureUrl: z.string().url(),
  originalFilename: z.string(),
  format: z.string(),
  width: z.number().int(),
  height: z.number().int(),
  resource_type: z.enum(["image", "video", "raw", "auto"]),
  userId: idSchema,
});

export type Image = z.infer<typeof imageInputs>;

export const couponCodeSchema = z
  .string()
  .trim()
  .min(4)
  .max(16)
  .refine(isAlphaNumeric, { message: "Invalid coupon code" });

export const productSchema = z.object({
  title: z
    .string({
      required_error: "Enter a title",
    })
    .trim()
    .min(1, "Enter a title"),
  price: z
    .number({
      required_error: "Enter a price",
      invalid_type_error: "Enter a valid price",
    })
    .int("Price cannot have decimal values")
    .positive("Price should be greater than 0"),
  description: z
    .string({
      required_error: "Enter a description",
    })
    .trim()
    .min(10, "Description must be at least 10 characters long"),
  images: z
    .array(imageInputs)
    .min(1, {
      message: "Oops! you need to upload at least 5 images",
    })
    .max(10, {
      message: "Cannot upload more than 10 images",
    }),
  categoryId: z
    .string({
      required_error: "select a category",
    })
    .trim()
    .cuid({ message: "Something went wrong, try again." }),
  brandId: z
    .string({
      required_error: "select a brand",
    })
    .trim()
    .cuid({ message: "Something went wrong, try again." }),
  modelId: z
    .string({
      required_error: "select a model",
    })
    .trim()
    .cuid({ message: "Something went wrong, try again." }),
  // bidDuration: plansSchema.default(plans[0]),
  multipleChoiceAnswers: z
    .array(
      z.union([
        z.object({
          questionId: idSchema,
          required: z.literal(true),
          type: z.enum([
            MultipleChoiceQuestionType.Dropdown,
            MultipleChoiceQuestionType.Variant,
            MultipleChoiceQuestionType.RadioGroup,
          ]),
          valueId: z
            .string({
              required_error: "Hold on! Please select an option.",
            })
            .trim()
            .cuid({ message: "Hold on! Please select an option." }),
        }),
        z.object({
          questionId: idSchema,
          required: z.literal(false),
          type: z.enum([
            MultipleChoiceQuestionType.Dropdown,
            MultipleChoiceQuestionType.Variant,
            MultipleChoiceQuestionType.RadioGroup,
          ]),
          valueId: z
            .string({
              required_error: "Hold on! Please select an option.",
            })
            .trim()
            .cuid({ message: "Hold on! Please select an option." })
            .optional(),
        }),
        z.object({
          questionId: idSchema,
          required: z.literal(true),
          type: z.enum([MultipleChoiceQuestionType.Checkbox]),
          valueIds: z
            .array(
              z
                .string({
                  required_error: "Hold on! Please check at least one option.",
                })
                .trim()
                .cuid({
                  message: "Hold on! Please check at least one option.",
                }),
            )
            .nonempty({
              message: "Hold on! Please check at least one option.",
            }),
        }),
        z.object({
          questionId: idSchema,
          required: z.literal(false),
          type: z.enum([MultipleChoiceQuestionType.Checkbox]),
          valueIds: z.array(
            z
              .string({
                required_error: "Hold on! Please check at least one option.",
              })
              .trim()
              .cuid({ message: "Hold on! Please check at least one option." }),
          ),
        }),
      ]),
    )
    .default([]),
  atomicAnswers: z.array(
    z.union([
      z.object({
        questionId: idSchema,
        required: z.literal(true),
        type: z.enum([AtomicQuestionType.Text, AtomicQuestionType.Paragraph]),
        answerContent: z
          .string()
          .trim()
          .min(1, "Oops! Please fill out this field."),
      }),
      z.object({
        questionId: idSchema,
        required: z.literal(true),
        type: z.enum([AtomicQuestionType.Number]),
        answerContent: z.number().min(1, "Oops! Enter a number here."),
      }),
      z.object({
        questionId: idSchema,
        required: z.literal(true),
        type: z.enum([AtomicQuestionType.Date]),
        answerContent: z
          .date({
            required_error: "Oops! Pick a date, please.",
            invalid_type_error: "Invalid date",
          })
          .refine((date) => date.getTime() > Date.now(), {
            message: "Oops! Pick a date, please.",
          }),
      }),
      z.object({
        questionId: idSchema,
        required: z.literal(false),
        type: z.enum([AtomicQuestionType.Text, AtomicQuestionType.Paragraph]),
        answerContent: z.string().trim().optional(),
      }),
      z.object({
        questionId: idSchema,
        required: z.literal(false),
        type: z.enum([AtomicQuestionType.Number]),
        answerContent: z.number().optional(),
      }),
      z.object({
        questionId: idSchema,
        required: z.literal(false),
        type: z.enum([AtomicQuestionType.Date]),
        answerContent: z
          .date({
            required_error: "Oops! Pick a date, please.",
            invalid_type_error: "Invalid date",
          })
          .optional()
          .refine((date) => (!date ? true : date.getTime() > Date.now()), {
            message: "Oops! Pick a date, please.",
          }),
      }),
    ]),
  ),
  couponCode: couponCodeSchema.optional(),
  addressId: idSchema.optional(),
});

export type ProductSchemaKeys = keyof Omit<
  typeof productSchema._type,
  "atomicAnswers" | "multipleChoiceAnswers"
>;

export type ProductFormError = {
  [key in ProductSchemaKeys]?: ZodIssue;
} & {
  atomicAnswers?: ZodIssue[];
  multipleChoiceAnswers?: ZodIssue[];
};

export const multipleChoiceQuestionSchema = z.object({
  questionContent: z
    .string({
      required_error: "Enter the question",
    })
    .trim()
    .min(1, "Question cannot be empty")
    .max(255, "Coice must be less than 255 characters"),
  type: z.enum(multipleChoiceQuestionTypeArray, {
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
        .max(255, "Choice must be less than 255 characters"),
    )
    .nonempty({ message: "Enter at least one choice" }),
});

export const atomicQuestionSchema = z.object({
  questionContent: z
    .string({
      required_error: "Enter a question",
    })
    .trim()
    .min(1, "Question cannot be empty")
    .max(255, "Question must be less than 255 characters"),
  type: z.enum(atomicQuestionTypeArray, {
    required_error: "Select a type for the question",
    invalid_type_error: "Invalid Question type",
  }),
  required: z.boolean().default(true),
});

export const priceRangeSchema = z
  .tuple([
    z
      .number({ required_error: "Enter the minimum price range" })
      .int({ message: "Enter a valid minimum price range" })
      .positive({ message: "Enter a valid minimum price range" }),
    z
      .number({ required_error: "Enter the maximum price range" })
      .int({ message: "Enter a valid maximum price range" })
      .positive({ message: "Enter a valid maximum price range" }),
  ])
  .refine(([min, max]) => min < max, {
    message: "Minimum price range should be less than maximum price range",
  });

export const modelSchema = z.object({
  name: z
    .string({
      required_error: "Enter a name",
    })
    .trim()
    .min(1, "Enter a name")
    .max(255, "Name must be less than 255 characters"),
  priceRange: priceRangeSchema,
  brandId: idSchema,
  categoryId: idSchema,
  multipleChoiceQuestions: z.array(multipleChoiceQuestionSchema),
  atomicQuestions: z.array(atomicQuestionSchema),
  state: z.enum(states),
});

export const addressSchema = z.object({
  tag: z.string().optional(),
  addressLine1: z
    .string({ required_error: "Address Line 1 field is required" })
    .trim(),
  addressLine2: z.string().optional(),
  city: z.string({ required_error: "Enter your city" }),
  state: z.enum(states, { required_error: "Selecy your state" }),
  country: z.string({ required_error: "Enter your country" }),
  postalCode: z
    .string()
    .trim()
    .length(6, "Enter a valid 6 digit postal code")
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid postal code"),
});

type ProvidedMultipleChoiceQuestionAnswer = z.infer<
  typeof productSchema
>["multipleChoiceAnswers"][0];

export const validateMultipleChoiceQuestionInput = (
  multipleChoiceQuestions: MultipleChoiceQuestionPayloadIncluded[],
  providedChoices: ProvidedMultipleChoiceQuestionAnswer[],
) => {
  for (const question of multipleChoiceQuestions) {
    // check if the model question is provided
    const providedChoice = providedChoices.find(
      (providedVarientOption) =>
        providedVarientOption.questionId === question.id,
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
        providedChoice.valueIds.includes(choice.id),
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
        (choice) => choice.id === providedChoice.valueId,
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
  providedAnswers: z.infer<typeof productSchema>["atomicAnswers"],
) => {
  for (const question of questions) {
    // check if the model question is provided
    const providedAnswer = providedAnswers.find(
      (providedAnswer) => providedAnswer.questionId === question.id,
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
