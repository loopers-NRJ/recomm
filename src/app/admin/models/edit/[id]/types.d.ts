import { type MultipleChoiceQuestionPayloadIncluded } from "@/types/prisma";
import type { AtomicQuestion } from "@prisma/client";

export type MultipleChoiceQuestion = MultipleChoiceQuestionPayloadIncluded;
export type Question = AtomicQuestion | MultipleChoiceQuestion;
