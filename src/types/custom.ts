import { type ReactNode } from "react";

export interface Item {
  id: string;
  name: string;
}

export type OptionalItem = Item | undefined;

export type OmitUndefined<T> = T extends undefined ? never : T;

export type DefaultParams = Record<string, string | string[]>;
export type DefaultSearchParams = Record<string, string | string[] | undefined>;
export interface PageProps<
  Params = DefaultParams,
  SearchParams = DefaultSearchParams,
> {
  params: Params;
  searchParams: SearchParams;
}

export type Page<Params = DefaultParams, SearchParams = DefaultParams> = (
  props: PageProps<Params, SearchParams>,
) => ReactNode | Promise<ReactNode>;
