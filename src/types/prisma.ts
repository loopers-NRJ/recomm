import {
  MultipleChoiceQuestionType,
  Prisma,
  AtomicQuestionType,
  AccessType,
  State,
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
        category: true,
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
          brand: true,
          category: true,
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
      selectedChoices: {
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

export const modelsPayload = Prisma.validator<Prisma.ModelDefaultArgs>()({
  include: {
    brand: true,
    category: true,
  },
});

export type ModelPayloadIncluded = Prisma.ModelGetPayload<typeof modelsPayload>;

export const singleModelPayload = Prisma.validator<Prisma.ModelDefaultArgs>()({
  include: {
    brand: true,
    category: true,
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
    featuredCategory: {
      include: {
        image: true,
      },
    },
  },
});

export type CategoryPayloadIncluded = Prisma.CategoryGetPayload<
  typeof CategoryPayload
>;

export const BrandPayload = Prisma.validator<Prisma.BrandDefaultArgs>()({
  include: {
    createdBy: true,
  },
});

export type BrandPayloadIncluded = Prisma.BrandGetPayload<typeof BrandPayload>;

export const FeaturedCategoryPayload =
  Prisma.validator<Prisma.FeaturedCategoryDefaultArgs>()({
    include: {
      category: true,
      image: true,
    },
  });

export type FeaturedCategoryPayloadIncluded = Prisma.FeaturedCategoryGetPayload<
  typeof FeaturedCategoryPayload
>;

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

export const MultipleChoiceQuestionTypeArray = [
  MultipleChoiceQuestionType.Checkbox,
  MultipleChoiceQuestionType.Dropdown,
  MultipleChoiceQuestionType.RadioGroup,
  MultipleChoiceQuestionType.Variant,
] as const;

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
  AccessType.updateRole,
  AccessType.updateUsersRole,
  AccessType.deleteRole,

  AccessType.updateUser,
  AccessType.deleteUser,
] as const;

export const states = [
  State.Andhra_Pradesh,
  State.Arunachal_Pradesh,
  State.Assam,
  State.Bihar,
  State.Chhattisgarh,
  State.Goa,
  State.Gujarat,
  State.Haryana,
  State.Himachal_Pradesh,
  State.Jharkhand,
  State.Karnataka,
  State.Kerala,
  State.Madhya_Pradesh,
  State.Maharashtra,
  State.Manipur,
  State.Meghalaya,
  State.Mizoram,
  State.Nagaland,
  State.Odisha,
  State.Punjab,
  State.Rajasthan,
  State.Sikkim,
  State.Tamil_Nadu,
  State.Telangana,
  State.Tripura,
  State.Uttar_Pradesh,
  State.Uttarakhand,
  State.West_Bengal,
] as const;
