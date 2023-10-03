import { OptionType, QuestionType } from "@prisma/client";

export interface Item {
  id: string;
  name: string;
}

export type FetchItems = (input: unknown) => {
  data: Item[] | Error | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
};

export type OptionalItem = Item | undefined;

export type AllQuestionType = QuestionType | OptionType;
export const questionTypes: AllQuestionType [] = [
  QuestionType.Text,
  QuestionType.Paragraph,
  QuestionType.Number,
  QuestionType.Date,
  OptionType.Dropdown,
  OptionType.Variant,
  OptionType.Checkbox,
];
export type Question = {
  id: string;
  question: string;
  required: boolean;
} & (
  | {
      type: QuestionType;
    }
  | {
      type: OptionType;
      options: [string, ...string[]];
    }
);

// TODO: @naveen you may need this type to represent the answer
export type Answer = { questionId: string } & (
  | {
      type: Extract<QuestionType, "Text" | "Paragraph">;
      answer: string;
    }
  | {
      type: Extract<QuestionType, "Number">;
      answer: number;
    }
  | {
      type: Extract<QuestionType, "Date">;
      answer: Date;
    }
  | {
      type: Extract<OptionType, "Dropdown" | "Variant">;
      answerId: string;
    }
  | {
      type: Extract<OptionType, "Checkbox">;
      answerId: [string, ...string[]];
    }
);
