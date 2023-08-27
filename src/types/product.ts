import { Product, Model, Brand, Category } from "@prisma/client";

export type ProductObj = Product & {
  model: Model & {
    brand: Brand;
    categories: Category[];
  };
};

export default ProductObj;
