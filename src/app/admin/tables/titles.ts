export const titles = [
  "category",
  "featured-category",
  "brands",
  "models",
  "products",
  "users",
  "roles",
  "logs",
] as const;
export type Title = (typeof titles)[number];
