"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type AllQuestionType } from "@/types/prisma";
import { Check, X } from "lucide-react";
import type { AtomicQuestion } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { QuestionTypeSelect } from "./QuestionTypeSelect";

export function AtomicQuestionEditor({
  question,
  setQuestion,
  getDisableState,
  changeQuestionType,
}: {
  question: AtomicQuestion;
  setQuestion: (newQuestion: AtomicQuestion) => void;
  getDisableState: (question: AtomicQuestion) => boolean;
  changeQuestionType: (questionId: string, type: AllQuestionType) => void;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-2">
      <Input
        value={question.questionContent}
        onChange={(e) =>
          setQuestion({ ...question, questionContent: e.target.value ?? "" })
        }
      />
      <Switch
        title="Required"
        checked={question.required}
        onCheckedChange={(checked) =>
          setQuestion({ ...question, required: checked })
        }
        className="scale-90 data-[state=checked]:bg-red-400"
      />
      <QuestionTypeSelect
        type={question.type}
        setType={(newType) => changeQuestionType(question.id, newType)}
      />
      <Button variant="ghost" size="sm" title="Delete">
        <X className="text-red-400" />
      </Button>
      {!getDisableState(question) && (
        <Button variant="ghost" size="sm" title="Update">
          <Check />
        </Button>
      )}
    </div>
  );
}
