import type {
  MultipleChoiceQuestionType,
  AtomicQuestionType,
} from "@prisma/client";

export interface Item {
  id: string;
  name: string;
}

export type OptionalItem = Item | undefined;

export type Question = {
  id: string;
  questionContent: string;
  required: boolean;
} & (
  | {
      type: AtomicQuestionType;
    }
  | {
      type: MultipleChoiceQuestionType;
      choices: string[];
    }
);

export interface MultipleChoiceQuestion {
  id: string;
  questionContent: string;
  required: boolean;
  type: MultipleChoiceQuestionType;
  choices: string[];
}

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
) => JSX.Element | Promise<JSX.Element>;
