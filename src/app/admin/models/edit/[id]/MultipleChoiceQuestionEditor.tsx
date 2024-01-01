"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type AllQuestionType } from "@/types/prisma";
import { Check, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { QuestionTypeSelect } from "./QuestionTypeSelect";
import { type MultipleChoiceQuestion } from "./types";
import { ChoiceDisplay } from "./ChoiceDisplay";

export function MultipleChoiceQuestionEditor({
  question,
  setQuestion,
  getDisableState,
  changeQuestionType,
}: {
  question: MultipleChoiceQuestion;
  setQuestion: (newQuestion: MultipleChoiceQuestion) => void;
  getDisableState: (question: MultipleChoiceQuestion) => boolean;
  changeQuestionType: (questionId: string, type: AllQuestionType) => void;
}) {
  return (
    <div className="flex w-full justify-between gap-2">
      <div className="flex w-full flex-col gap-2">
        <Input
          value={question.questionContent}
          onChange={(e) =>
            setQuestion({ ...question, questionContent: e.target.value ?? "" })
          }
        />
        <ChoiceDisplay question={question} />
        <Input
          placeholder="Add more"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              alert((e.target as HTMLInputElement).value);
            }
          }}
        />
      </div>
      <div className="flex h-10 items-center">
        <Switch
          title="Required"
          checked={question.required}
          onCheckedChange={(checked) =>
            setQuestion({ ...question, required: checked })
          }
          className="scale-90 data-[state=checked]:bg-red-400"
        />
      </div>
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
