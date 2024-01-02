"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { multipleChoiceQuestionTypeArray } from "@/types/prisma";
import { Check } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { type MultipleChoiceQuestion } from "../types";
import { ChoiceDisplay } from "./ChoiceDisplay";
import { api } from "@/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { type MultipleChoiceQuestionType } from "@prisma/client";
import { Cross1Icon } from "@radix-ui/react-icons";

export function MultipleChoiceQuestionEditor({
  question,
  setQuestion,
  removeQuestion,
}: {
  question: MultipleChoiceQuestion;
  setQuestion: (newQuestion: MultipleChoiceQuestion) => void;
  removeQuestion: (questionId: string) => void;
}) {
  const [questionContent, setQuestionContent] = useState(
    question.questionContent,
  );

  const addCoice = api.model.addChoice.useMutation();
  const updateQuestion = api.model.updateMultipleChoiceQuestion.useMutation();
  const deleteQuestion = api.model.deleteMultipleChoiceQuestion.useMutation();

  return (
    <div className="flex w-full justify-between gap-2">
      <div className="flex w-full flex-col gap-2">
        <Input
          value={questionContent}
          onChange={(e) => setQuestionContent(e.target.value)}
        />
        <ChoiceDisplay question={question} setQuestion={setQuestion} />
        <Input
          placeholder="Add more"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const newChoice = (e.target as HTMLInputElement).value;
            if (newChoice.trim() === "") return;
            addCoice
              .mutateAsync({
                value: newChoice,
                modelId: question.modelId,
                questionId: question.id,
              })
              .then((choice) =>
                setQuestion({
                  ...question,
                  choices: [...question.choices, choice],
                }),
              )
              .catch(console.error);
          }}
          disabled={addCoice.isLoading}
        />
      </div>
      <div className="flex h-fit items-center gap-2">
        <div className="flex h-10 items-center">
          <Switch
            title="Required"
            checked={question.required}
            disabled={updateQuestion.isLoading}
            onCheckedChange={(required) => {
              updateQuestion
                .mutateAsync({ questionId: question.id, required })
                .then(setQuestion)
                .catch(console.error);
            }}
            className="scale-90 data-[state=checked]:bg-red-400"
          />
        </div>
        <MultipleChoiceQuestionTypeSelect
          question={question}
          setQuestion={setQuestion}
        />

        <Button
          variant="ghost"
          size="sm"
          title="Delete"
          onClick={() => {
            deleteQuestion
              .mutateAsync({ questionId: question.id })
              .then(() => removeQuestion(question.id))
              .catch(console.error);
          }}
          disabled={deleteQuestion.isLoading}
          className="h-6 w-6 p-0"
        >
          <Cross1Icon className="text-red-600" />
        </Button>
        {questionContent.trim() !== "" &&
          questionContent.trim() !== question.questionContent && (
            <Button
              variant="ghost"
              size="sm"
              title="Update"
              onClick={() => {
                updateQuestion
                  .mutateAsync({ questionId: question.id, questionContent })
                  .then(setQuestion)
                  .catch(console.error);
              }}
              disabled={updateQuestion.isLoading}
            >
              <Check />
            </Button>
          )}
      </div>
    </div>
  );
}

export function MultipleChoiceQuestionTypeSelect({
  question,
  setQuestion,
}: {
  question: MultipleChoiceQuestion;
  setQuestion: (newType: MultipleChoiceQuestion) => void;
}) {
  const updateQuestion = api.model.updateMultipleChoiceQuestion.useMutation();

  return (
    <Select
      value={question.type}
      onValueChange={(value) => {
        updateQuestion
          .mutateAsync({
            questionId: question.id,
            type: value as MultipleChoiceQuestionType,
          })
          .then(setQuestion)
          .catch(console.error);
      }}
      disabled={updateQuestion.isLoading}
    >
      <SelectTrigger className="w-[200px] shrink-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {multipleChoiceQuestionTypeArray.map((type) => (
          <SelectItem value={type} key={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
