// functionality
export const defaultLimit = 30 as const;
export const maxLimit = 100 as const;
export const defaultSortOrder = "desc" as const;
export const defaultSearch = "" as const;
export const defaultSortBy = "createdAt" as const;
export type SortOrder = "asc" | "desc";
export type SortBy = "name" | "createdAt";

// featured Category
export const maxFeaturedCategory = 12 as const;

// headers labels
export const userLatitudeHeaderName = "x-user-latitude" as const;
export const userLongitudeHeaderName = "x-user-longitude" as const;
export const requestPathHeaderName = "x-forwarded-path" as const;
export const adminPageRegex = /\/admin\//g;
export const pathHeaderName = "x-pathname" as const;

// image upload
export const maxImageCount = 5 as const;
export const imageFieldName = "images" as const;
export const maxImageSizeInMB = 10 as const;
