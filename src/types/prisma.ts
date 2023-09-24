import { OptionType, Prisma, QuestionType } from "@prisma/client";

export const productsPayload = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: {
    model: {
      include: {
        brand: true,
        categories: true,
      },
    },
    seller: true,
    room: true,
    images: true,
  },
});
export type ProductsPayloadIncluded = Prisma.ProductGetPayload<
  typeof productsPayload
>;

export const singleProductPayload =
  Prisma.validator<Prisma.ProductDefaultArgs>()({
    include: {
      buyer: true,
      seller: true,
      model: {
        include: {
          image: true,
          brand: {
            include: {
              image: true,
            },
          },
        },
      },
      room: {
        include: {
          bids: {
            include: {
              user: true,
            },
          },
        },
      },
      images: true,
      optionValues: {
        include: {
          option: true,
        },
      },
      answers: true,
    },
  });
export type SingleProductPayloadIncluded = Prisma.ProductGetPayload<
  typeof singleProductPayload
>;

export const modelPayload = Prisma.validator<Prisma.ModelDefaultArgs>()({
  include: {
    image: true,
    brand: {
      include: {
        image: true,
      },
    },
    categories: {
      include: {
        image: true,
      },
    },
  },
});

export type ModelPayloadIncluded = Prisma.ModelGetPayload<typeof modelPayload>;

export const singleModelPayload = Prisma.validator<Prisma.ModelDefaultArgs>()({
  include: {
    image: true,
    brand: {
      include: {
        image: true,
      },
    },
    categories: {
      include: {
        image: true,
      },
    },
    options: {
      include: {
        values: true,
      },
    },
    questions: true,
  },
});
export type SingleModelPayloadIncluded = Prisma.ModelGetPayload<
  typeof singleModelPayload
>;

const OptionPayload = Prisma.validator<Prisma.OptionDefaultArgs>()({
  include: {
    values: true,
  },
});
export type OptionPayloadIncluded = Prisma.OptionGetPayload<
  typeof OptionPayload
>;

export const OptionTypeArray = [
  OptionType.Dropdown,
  OptionType.Checkbox,
  OptionType.Variant,
] as const;
export const QuestionTypeArray = [
  QuestionType.Text,
  QuestionType.Paragraph,
  QuestionType.Number,
  QuestionType.Date,
] as const;
