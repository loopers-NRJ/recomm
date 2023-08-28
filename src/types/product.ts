import { Product, Model, Brand, Category, Bid, User } from "@prisma/client";

export type ProductObj = Product & {
  model: Model & {
    brand: Brand;
    categories: Category[];
  };
  room?: {
    bids: (Bid & {
      user: User;
    })[];
  };
};

export default ProductObj;
