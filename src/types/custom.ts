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

// TODO: @naveen you may need this type to represent the answer
export type Answer = { questionId: string } & (
  | {
      type: Extract<AtomicQuestionType, "Text" | "Paragraph">;
      answer: string;
    }
  | {
      type: Extract<AtomicQuestionType, "Number">;
      answer: number;
    }
  | {
      type: Extract<AtomicQuestionType, "Date">;
      answer: Date;
    }
  | {
      type: Extract<
        MultipleChoiceQuestionType,
        "Dropdown" | "Variant" | "RadioGroup"
      >;
      answerId: string;
    }
  | {
      type: Extract<MultipleChoiceQuestionType, "Checkbox">;
      answerId: [string, ...string[]];
    }
);
