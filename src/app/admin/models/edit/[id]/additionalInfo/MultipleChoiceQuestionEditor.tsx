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
import { useRef, useState } from "react";
import { type MultipleChoiceQuestionType } from "@prisma/client";
import { Cross1Icon } from "@radix-ui/react-icons";
import toast from "react-hot-toast";
import { errorHandler } from "@/utils/errorHandler";

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

  const addCoice = api.model.addChoice.useMutation({
    onSuccess: (newChoice) => {
      if (typeof newChoice === "string") {
        return toast.error(newChoice);
      }
      setQuestion({
        ...question,
        choices: [...question.choices, newChoice],
      });
      if (addMoreInputRef.current) {
        addMoreInputRef.current.value = "";
      }
    },
    onError: errorHandler,
  });
  const updateQuestion = api.model.updateMultipleChoiceQuestion.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      setQuestion(result);
    },
    onError: errorHandler,
  });
  const deleteQuestion = api.model.deleteMultipleChoiceQuestion.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      removeQuestion(question.id);
    },
    onError: errorHandler,
  });

  const addMoreInputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex w-full justify-between gap-2">
      <div className="flex w-full flex-col gap-2">
        <Input
          value={questionContent}
          onChange={(e) => setQuestionContent(e.target.value)}
        />
        <ChoiceDisplay question={question} setQuestion={setQuestion} />
        <Input
          ref={addMoreInputRef}
          placeholder="Add more"
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            const newChoice = (e.target as HTMLInputElement).value;
            if (newChoice.trim() === "") return;
            addCoice.mutate({
              value: newChoice,
              modelId: question.modelId,
              questionId: question.id,
            });
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
              updateQuestion.mutate({ questionId: question.id, required });
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
            deleteQuestion.mutate({ questionId: question.id });
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
                updateQuestion.mutate({
                  questionId: question.id,
                  questionContent,
                });
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
  const updateQuestion = api.model.updateMultipleChoiceQuestion.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        return toast.error(result);
      }
      setQuestion(result);
    },
    onError: errorHandler,
  });

  return (
    <Select
      value={question.type}
      onValueChange={(value) => {
        updateQuestion.mutate({
          questionId: question.id,
          type: value as MultipleChoiceQuestionType,
        });
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
