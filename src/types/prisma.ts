import {
  MultipleChoiceQuestionType,
  Prisma,
  AtomicQuestionType,
} from "@prisma/client";

export const userPayload = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    role: {
      include: {
        accesses: true,
      },
    },
  },
});

export type UserPayloadIncluded = Prisma.UserGetPayload<typeof userPayload>;

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
      choices: {
        include: {
          question: true,
        },
      },
      answers: {
        include: {
          question: true,
        },
      },
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
    multipleChoiceQuestions: {
      include: {
        choices: true,
      },
    },
    atomicQuestions: true,
  },
});
export type SingleModelPayloadIncluded = Prisma.ModelGetPayload<
  typeof singleModelPayload
>;

const MultipleChoiceQuestionPayload =
  Prisma.validator<Prisma.MultipleChoiceQuestionDefaultArgs>()({
    include: {
      choices: true,
    },
  });
export type MultipleChoiceQuestionPayloadIncluded =
  Prisma.MultipleChoiceQuestionGetPayload<typeof MultipleChoiceQuestionPayload>;

// these fields are hardcoded because zod schema requires a readonly property

// export const MultipleChoiceQuestionTypeArray = Object.keys(
//   MultipleChoiceQuestionType
// ) as MultipleChoiceQuestionType[];
export const MultipleChoiceQuestionTypeArray = [
  MultipleChoiceQuestionType.Checkbox,
  MultipleChoiceQuestionType.Dropdown,
  MultipleChoiceQuestionType.RadioGroup,
  MultipleChoiceQuestionType.Variant,
] as const;

// export const AtomicQuestionTypeArray = Object.keys(
//   AtomicQuestionType
// ) as AtomicQuestionType[];

export const AtomicQuestionTypeArray = [
  AtomicQuestionType.Text,
  AtomicQuestionType.Paragraph,
  AtomicQuestionType.Number,
  AtomicQuestionType.Date,
] as const;

export const allQuestionTypes = [
  ...AtomicQuestionTypeArray,
  ...MultipleChoiceQuestionTypeArray,
] as const;

export type AllQuestionType = (typeof allQuestionTypes)[number];

export const RolePayload = Prisma.validator<Prisma.RoleDefaultArgs>()({
  include: {
    accesses: true,
  },
});

export type RolePayloadIncluded = Prisma.RoleGetPayload<typeof RolePayload>;
