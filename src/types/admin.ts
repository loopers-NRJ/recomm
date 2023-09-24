export interface AdminVariantInput {
  id: string;
  search: string;
  name: string;
  values: string[];
}

export interface Pagination {
  pageIndex: number;
  pageSize: number;
}
