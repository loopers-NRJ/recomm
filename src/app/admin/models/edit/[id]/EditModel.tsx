"use client";

import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  states,
  type SingleModelPayloadIncluded,
  type MultipleChoiceQuestionPayloadIncluded,
  type AllQuestionType,
  atomicQuestionTypeArray,
} from "@/types/prisma";
import { Check } from "lucide-react";
import { useCallback, useState } from "react";
import CategoryComboBox from "@/components/common/CategoryComboBox";
import type { Item } from "@/types/custom";
import BrandComboBox from "@/components/common/BrandComboBox";
import type { AtomicQuestion, AtomicQuestionType, State } from "@prisma/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultipleChoiceQuestionEditor } from "./MultipleChoiceQuestionEditor";
import { AtomicQuestionEditor } from "./AtomicQuestionEditor";

type MultipleChoiceQuestion = MultipleChoiceQuestionPayloadIncluded;
type Question = AtomicQuestion | MultipleChoiceQuestion;

const isAtomicQuestion = (question: Question): question is AtomicQuestion =>
  atomicQuestionTypeArray.includes(question.type as AtomicQuestionType);

export default function EditModel({
  model,
}: {
  model: SingleModelPayloadIncluded;
}) {
  const [modelName, setModelName] = useState(model.name);
  const [selectedCategory, setSelectedCategory] = useState<Item>(
    model.category,
  );
  const [selectedBrand, setSelectedBrand] = useState<Item>(model.brand);
  const [createdState, setCreatedState] = useState(model.createdState);

  const [questions, setQuestions] = useState<Question[]>([
    ...model.atomicQuestions,
    ...model.multipleChoiceQuestions,
  ]);

  const handleQuestionChange = useCallback((newQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((oldQuestion) =>
        oldQuestion.id === newQuestion.id ? newQuestion : oldQuestion,
      ),
    );
  }, []);

  const getAtomicQuestionDisableState = useCallback(
    (newQuestion: Question) => {
      const oldQuestion = model.atomicQuestions.find(
        (question) => question.id === newQuestion.id,
      );
      if (!oldQuestion) {
        return false;
      }
      return (
        oldQuestion.questionContent === newQuestion.questionContent &&
        oldQuestion.type === newQuestion.type &&
        oldQuestion.required === newQuestion.required
      );
    },
    [model.atomicQuestions],
  );

  const getMultipleChoiceQuestionDisableState = useCallback(
    (newQuestion: MultipleChoiceQuestion) => {
      const oldQuestion = model.multipleChoiceQuestions.find(
        (question) => question.id === newQuestion.id,
      );
      if (!oldQuestion) {
        return false;
      }
      return (
        oldQuestion.questionContent === newQuestion.questionContent &&
        oldQuestion.type === newQuestion.type &&
        oldQuestion.required === newQuestion.required
      );
    },
    [model.multipleChoiceQuestions],
  );

  const handleQuestionTypeChange = useCallback(
    (questionId: string, type: AllQuestionType) =>
      setQuestions(
        questions.map((question) => {
          if (question.id === questionId) {
            if (question.type === type) {
              return question;
            }
            const prevType = atomicQuestionTypeArray.includes(
              question.type as AtomicQuestionType,
            )
              ? "atomic"
              : "multipleChoice";
            const newType = atomicQuestionTypeArray.includes(
              type as AtomicQuestionType,
            )
              ? "atomic"
              : "multipleChoice";

            switch (true) {
              case prevType === "atomic" && newType === "atomic":
              case prevType === "multipleChoice" &&
                newType === "multipleChoice":
              case prevType === "multipleChoice" && newType === "atomic":
                return { ...question, type } as Question;
              case prevType === "atomic" && newType === "multipleChoice":
                return { choices: [], ...question, type };
            }
          }
          return question;
        }),
      ),
    [questions],
  );
  const [modelNameEditEnabled, setModelNameEditEnabled] = useState(false);
  return (
    <Container className="flex flex-col gap-8 border p-4 pb-20">
      <section className="flex w-full flex-col items-center gap-2">
        <h2 className="text-lg font-semibold">Basic Informations</h2>
        <div className="flex w-full items-center justify-between gap-2">
          <Label className="flex w-full items-center justify-between gap-2">
            Name
            {modelNameEditEnabled ? (
              <Input
                className="w-fit"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                onBlur={() => {
                  if (modelName === model.name) {
                    setModelNameEditEnabled(false);
                  }
                }}
              />
            ) : (
              <Button
                variant="ghost"
                onClick={() => setModelNameEditEnabled(true)}
                className="min-w-[200px]"
              >
                {modelName}
              </Button>
            )}
          </Label>
          {model.name !== modelName && modelName.trim() !== "" && (
            <Button variant="ghost" size="sm" title="Update">
              <Check />
            </Button>
          )}
        </div>

        {/* edit model category */}
        <div className="flex w-full items-center justify-between gap-2">
          <CategoryComboBox
            selected={selectedCategory}
            onSelect={(category) => category && setSelectedCategory(category)}
          />
          {selectedCategory.id !== model.categoryId && (
            <Button variant="ghost" size="sm" title="Update">
              <Check />
            </Button>
          )}
        </div>

        {/* edit model brand */}
        <div className="flex w-full items-center justify-between gap-2">
          <BrandComboBox
            selected={selectedBrand}
            onSelect={(brand) => brand && setSelectedBrand(brand)}
          />
          {selectedBrand.id !== model.brandId && (
            <Button variant="ghost" size="sm" title="Update">
              <Check />
            </Button>
          )}
        </div>

        {/* edit model brand */}
        <div className="flex w-full items-center justify-between gap-2">
          <Label className="flex w-full items-center justify-between gap-2">
            Created State
            <Select
              onValueChange={(value) => {
                setCreatedState(value as State);
              }}
              value={createdState}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="h-80">
                {states.map((state) => (
                  <SelectItem value={state} key={state}>
                    {state.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Label>
          {createdState !== model.createdState && (
            <Button variant="ghost" size="sm" title="Update">
              <Check />
            </Button>
          )}
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-2">
        <h2 className="text-lg font-semibold">Additional Questions</h2>
        {questions.map((question) =>
          isAtomicQuestion(question) ? (
            <AtomicQuestionEditor
              key={question.id}
              question={question}
              setQuestion={handleQuestionChange}
              getDisableState={getAtomicQuestionDisableState}
              changeQuestionType={handleQuestionTypeChange}
            />
          ) : (
            <MultipleChoiceQuestionEditor
              key={question.id}
              question={question}
              setQuestion={handleQuestionChange}
              getDisableState={getMultipleChoiceQuestionDisableState}
              changeQuestionType={handleQuestionTypeChange}
            />
          ),
        )}
      </section>
      <Button className="self-end">Add New Question</Button>
    </Container>
  );
}
