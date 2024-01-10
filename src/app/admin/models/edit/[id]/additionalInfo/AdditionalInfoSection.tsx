"use client";

import { useCallback, useState } from "react";
import type { Question, AtomicQuestion, Model } from "../types";
import { AtomicQuestionEditor } from "./AtomicQuestionEditor";
import { MultipleChoiceQuestionEditor } from "./MultipleChoiceQuestionEditor";
import { atomicQuestionTypeArray } from "@/types/prisma";
import { type AtomicQuestionType } from "@prisma/client";
import AddNewQuestion from "./AddNewQuestion";

const isAtomicQuestion = (question: Question): question is AtomicQuestion =>
  atomicQuestionTypeArray.includes(question.type as AtomicQuestionType);

export default function AdditionalInfoSection({ model }: { model: Model }) {
  const [questions, setQuestions] = useState<Question[]>([
    ...model.atomicQuestions,
    ...model.multipleChoiceQuestions,
  ]);

  const handleRemoveQuestion = useCallback((questionId: string) => {
    setQuestions((prev) =>
      prev.filter((question) => question.id !== questionId),
    );
  }, []);

  const handleQuestionChange = useCallback((newQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((oldQuestion) =>
        oldQuestion.id === newQuestion.id ? newQuestion : oldQuestion,
      ),
    );
  }, []);

  const addNewQuestion = useCallback((newQuestion: Question) => {
    setQuestions((prev) => [...prev, newQuestion]);
  }, []);

  return (
    <section className="flex w-full flex-col items-center gap-2">
      <h2 className="text-lg font-semibold">Additional Questions</h2>
      {questions.map((question) =>
        isAtomicQuestion(question) ? (
          <AtomicQuestionEditor
            key={question.id}
            question={question}
            setQuestion={handleQuestionChange}
            removeQuestion={handleRemoveQuestion}
          />
        ) : (
          <MultipleChoiceQuestionEditor
            key={question.id}
            question={question}
            setQuestion={handleQuestionChange}
            removeQuestion={handleRemoveQuestion}
          />
        ),
      )}

      <AddNewQuestion model={model} handler={addNewQuestion} />
    </section>
  );
}
