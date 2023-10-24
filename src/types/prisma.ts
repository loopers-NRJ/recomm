import {
  MultipleChoiceQuestionType,
  Prisma,
  AtomicQuestionType,
  AccessType,
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

export const CategoryPayload = Prisma.validator<Prisma.CategoryDefaultArgs>()({
  include: {
    image: true,
    featuredCategory: true,
  },
});

export type CategoryPayloadIncluded = Prisma.CategoryGetPayload<
  typeof CategoryPayload
>;

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

export const accessTypes = [
  AccessType.subscriber,
  AccessType.retailer,

  AccessType.readAccess,

  AccessType.createCategory,
  AccessType.updateCategory,
  AccessType.deleteCategory,

  AccessType.createBrand,
  AccessType.updateBrand,
  AccessType.deleteBrand,

  AccessType.createModel,
  AccessType.updateModel,
  AccessType.deleteModel,

  AccessType.updateProduct,
  AccessType.deleteProduct,

  AccessType.createRole,
  AccessType.updateUsersRole,
  AccessType.deleteRole,

  AccessType.updateUser,
  AccessType.deleteUser,
] as const;

export const RolePayload = Prisma.validator<Prisma.RoleDefaultArgs>()({
  include: {
    accesses: true,
  },
});

export type RolePayloadIncluded = Prisma.RoleGetPayload<typeof RolePayload>;

export const wishPayload = Prisma.validator<Prisma.WishDefaultArgs>()({
  include: {
    category: true,
    brand: true,
    model: true,
  },
});

export type WishPayloadIncluded = Prisma.WishGetPayload<typeof wishPayload>;
