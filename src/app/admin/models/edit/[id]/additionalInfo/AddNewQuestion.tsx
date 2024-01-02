"use client";

import { useCallback, useState } from "react";
import type {
  AtomicQuestion,
  MultipleChoiceQuestion,
  Question,
} from "../../../create/types";
import QuestionEditor from "../../../create/QuestionEditor";
import {
  atomicQuestionTypeArray,
  multipleChoiceQuestionTypeArray,
} from "@/types/prisma";
import type {
  AtomicQuestionType,
  MultipleChoiceQuestionType,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { v4 as uuid } from "uuid";
import { Check } from "lucide-react";
import type { Model, Question as UploadedQuestion } from "../types";
import { api } from "@/trpc/react";
import {
  atomicQuestionSchema,
  multipleChoiceQuestionSchema,
} from "@/utils/validation";

type ServerExpectedQuestion = {
  id: string;
  questionContent: string;
  required: boolean;
} & (
  | {
      type: AtomicQuestionType;
    }
  | {
      type: MultipleChoiceQuestionType;
      choices: [string, ...string[]];
    }
);

const isAtomicQuestion = (question: Question): question is AtomicQuestion =>
  atomicQuestionTypeArray.includes(question.type as AtomicQuestionType);

const isValidQuestion = (
  question: Question,
): question is ServerExpectedQuestion => {
  const result = isAtomicQuestion(question)
    ? atomicQuestionSchema.safeParse(question)
    : multipleChoiceQuestionSchema.safeParse(question);
  return result.success;
};

export default function AddNewQuestion({
  handler,
  model,
}: {
  handler: (newQuestion: UploadedQuestion) => void;
  model: Model;
}) {
  const [additionalQuestions, setAdditionalQuestions] = useState<Question[]>(
    [],
  );
  const handleSetQuestion = useCallback(
    (question: Question) => {
      const index = additionalQuestions.findIndex((q) => q.id === question.id);
      additionalQuestions[index] = question;
      setAdditionalQuestions([...additionalQuestions]);
    },
    [additionalQuestions],
  );

  const addAtomicQuestion = api.model.addAtomicQuestion.useMutation();
  const addMultipleChoiceQuestion =
    api.model.addMultipleChoiceQuestion.useMutation();

  return (
    <section className="flex w-full flex-col gap-4">
      {additionalQuestions.map((question) => (
        <div className="flex w-full gap-2" key={question.id}>
          <QuestionEditor
            className="grow"
            question={question}
            setQuestion={handleSetQuestion}
            deleteQuestion={() => {
              const index = additionalQuestions.findIndex(
                (q) => q.id === question.id,
              );
              additionalQuestions.splice(index, 1);
              setAdditionalQuestions([...additionalQuestions]);
            }}
            changeQuestionType={(newType) => {
              const index = additionalQuestions.findIndex(
                (q) => q.id === question.id,
              );
              if (
                multipleChoiceQuestionTypeArray.includes(
                  newType as MultipleChoiceQuestionType,
                )
              ) {
                (additionalQuestions[index] as MultipleChoiceQuestion).choices =
                  [];
              }
              additionalQuestions[index]!.type = newType;
              setAdditionalQuestions([...additionalQuestions]);
            }}
          />
          {isValidQuestion(question) && (
            <Button
              variant="ghost"
              size="sm"
              title="Update"
              onClick={() => {
                if (isAtomicQuestion(question)) {
                  addAtomicQuestion
                    .mutateAsync({ ...question, modelId: model.id })
                    .then(handler)
                    .catch(console.error);
                } else {
                  addMultipleChoiceQuestion
                    .mutateAsync({ ...question, modelId: model.id })
                    .then(handler)
                    .catch(console.error);
                }
              }}
              disabled={
                addAtomicQuestion.isLoading ||
                addMultipleChoiceQuestion.isLoading
              }
            >
              <Check />
            </Button>
          )}
        </div>
      ))}
      <Button
        onClick={() =>
          setAdditionalQuestions([
            ...additionalQuestions,
            {
              id: uuid(),
              questionContent: "",
              type: "Text",
              required: true,
            },
          ])
        }
        className="self-end"
      >
        Add New Question
      </Button>
    </section>
  );
}
