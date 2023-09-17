import {
  Bid,
  Brand,
  Category,
  Image,
  Model as PrismaModel,
  Product as PrismaProduct,
  User,
  VariantOption as PrismaVariantOption,
  VariantValue as PrismaVariantValue,
} from "@prisma/client";

export type Product = PrismaProduct & {
  model: PrismaModel & {
    brand: Brand;
    categories: Category[];
  };
  room?: {
    bids: (Bid & {
      user: User;
    })[];
  };
  images: Image[];
};

export type Model = PrismaModel & {
  brand: Brand & {
    image: Image | null;
  };
  category: Category & {
    image: Image | null;
  };
  image: Image | null;
};

export type VariantOption = PrismaVariantOption & {
  variantValues: PrismaVariantValue[];
};
