import type {
  MultipleChoiceQuestionType,
  AtomicQuestionType,
} from "@prisma/client";

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

export interface AtomicQuestion {
  id: string;
  questionContent: string;
  required: boolean;
  type: AtomicQuestionType;
}

export interface MultipleChoiceQuestion {
  id: string;
  questionContent: string;
  required: boolean;
  type: MultipleChoiceQuestionType;
  choices: string[];
}
