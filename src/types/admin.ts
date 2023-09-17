export interface AdminVariantInput {
  id: string;
  search: string;
  name: string;
  variantValues: string[];
}

export interface Pagination {
  pageIndex: number;
  pageSize: number;
}
