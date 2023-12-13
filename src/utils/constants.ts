// functionality
export const DefaultLimit = 30;
export const MaxLimit = 100;
export const DefaultSortOrder = "desc";
export const DefaultSearch = "";
export const DefaultSortBy = "createdAt";
export type SortOrder = "asc" | "desc";
export type SortBy = "name" | "createdAt";

// featured Category
export const MaxFeaturedCategory = 12;

// user location headers
export const UserLatitudeHeaderName = "x-user-latitude";
export const UserLongitudeHeaderName = "x-user-longitude";
export const RequestPathHeaderName = "x-forwarded-path";
export const adminPageRegex = /\/admin\//g;
