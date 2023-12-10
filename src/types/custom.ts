import { MultipleChoiceQuestionType, AtomicQuestionType } from "@prisma/client";

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
