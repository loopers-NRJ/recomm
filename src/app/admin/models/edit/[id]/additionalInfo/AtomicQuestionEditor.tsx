"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { atomicQuestionTypeArray } from "@/types/prisma";
import { Check } from "lucide-react";
import type { AtomicQuestion, AtomicQuestionType } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Cross1Icon } from "@radix-ui/react-icons";

export function AtomicQuestionEditor({
  question,
  setQuestion,
  removeQuestion,
}: {
  question: AtomicQuestion;
  setQuestion: (newQuestion: AtomicQuestion) => void;
  removeQuestion: (questionId: string) => void;
}) {
  const [questionContent, setQuestionContent] = useState(
    question.questionContent,
  );

  const updateQuestion = api.model.updateAtomicQuestion.useMutation();
  const deleteQuestion = api.model.deleteAtomicQuestion.useMutation();
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <Input
        value={questionContent}
        onChange={(e) => setQuestionContent(e.target.value)}
      />
      <div className="flex h-fit items-center gap-2">
        <Switch
          title="Required"
          checked={question.required}
          onCheckedChange={(required) => {
            updateQuestion
              .mutateAsync({ questionId: question.id, required })
              .then(setQuestion)
              .catch(console.error);
          }}
          disabled={updateQuestion.isLoading}
          className="scale-90 data-[state=checked]:bg-red-400"
        />
        <AtomicQuestionTypeSelect
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

function AtomicQuestionTypeSelect({
  question,
  setQuestion,
}: {
  question: AtomicQuestion;
  setQuestion: (newType: AtomicQuestion) => void;
}) {
  const updateQuestion = api.model.updateAtomicQuestion.useMutation();

  return (
    <Select
      value={question.type}
      onValueChange={(value) => {
        updateQuestion
          .mutateAsync({
            questionId: question.id,
            type: value as AtomicQuestionType,
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
        {atomicQuestionTypeArray.map((type) => (
          <SelectItem value={type} key={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
