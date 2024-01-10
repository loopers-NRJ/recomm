import type {
  SingleModelPayloadIncluded,
  MultipleChoiceQuestionPayloadIncluded,
} from "@/types/prisma";

export type { AtomicQuestion } from "@prisma/client";
export type MultipleChoiceQuestion = MultipleChoiceQuestionPayloadIncluded;
export type Question = AtomicQuestion | MultipleChoiceQuestion;
export type Model = SingleModelPayloadIncluded;
