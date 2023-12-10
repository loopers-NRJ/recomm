import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { MultipleChoiceQuestionPayloadIncluded } from "@/types/prisma";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { type ReactNode } from "react";
import { MultipleChoiceQuestionType } from "@prisma/client";
import { Button } from "../ui/button";

export type MultipleChoiceAnswer =
  | {
      type: "Dropdown" | "Variant" | "RadioGroup";
      questionId: string;
      valueId: string;
    }
  | {
      type: "Checkbox";
      questionId: string;
      valueIds: string[];
    };

interface MultipleChoiceQuestionInputFieldProps {
  question: MultipleChoiceQuestionPayloadIncluded;
  answer: MultipleChoiceAnswer;
  onChange: (answer: MultipleChoiceAnswer) => void;
  index?: number;
}
export default function MultipleChoiceQuestionInputField({
  question,
  answer,
  onChange,
  index,
}: MultipleChoiceQuestionInputFieldProps) {
  let InputField: ReactNode;

  if (
    question.type === MultipleChoiceQuestionType.Checkbox &&
    answer.type === MultipleChoiceQuestionType.Checkbox
  ) {
    InputField = (
      <div className="flex flex-col gap-3 ps-4">
        {question.choices.map((choice) => (
          <Label
            key={choice.id}
            className="flex cursor-pointer items-center gap-2"
          >
            <Checkbox
              checked={answer.valueIds.includes(choice.id)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange({
                    ...answer,
                    valueIds: [...answer.valueIds, choice.id],
                  });
                } else {
                  onChange({
                    ...answer,
                    valueIds: answer.valueIds.filter((id) => id !== choice.id),
                  });
                }
              }}
            />
            {choice.value}
          </Label>
        ))}
      </div>
    );
  }
  if (
    question.type === MultipleChoiceQuestionType.Dropdown &&
    answer.type === MultipleChoiceQuestionType.Dropdown
  ) {
    InputField = (
      <Select
        onValueChange={(value) => {
          onChange({
            ...answer,
            valueId: value,
          });
        }}
      >
        <SelectTrigger className="ms-4 w-[180px]">
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          {question.choices.map((choice) => (
            <SelectItem key={choice.id} value={choice.id}>
              {choice.value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (
    question.type === MultipleChoiceQuestionType.RadioGroup &&
    answer.type === MultipleChoiceQuestionType.RadioGroup
  ) {
    InputField = (
      <RadioGroup className="flex flex-col gap-3 ps-4">
        {question.choices.map((choice) => (
          <Label
            htmlFor={choice.id}
            key={choice.id}
            className="flex cursor-pointer items-center gap-2"
          >
            <RadioGroupItem
              value={choice.id}
              id={choice.id}
              onClick={() => {
                onChange({
                  ...answer,
                  valueId: choice.id,
                });
              }}
            />
            {choice.value}
          </Label>
        ))}
      </RadioGroup>
    );
  }

  if (
    question.type === MultipleChoiceQuestionType.Variant &&
    answer.type === MultipleChoiceQuestionType.Variant
  ) {
    InputField = (
      <div className="flex flex-wrap gap-1 ps-4 sm:gap-3">
        {question.choices.map((choice) => (
          <Button
            role="button"
            key={choice.id}
            className={`border ${
              answer.valueId === choice.id ? "bg-slate-200" : ""
            } `}
            variant="ghost"
            onClick={() => {
              if (answer.valueId === choice.id) {
                onChange({
                  ...answer,
                  valueId: "",
                });
              } else {
                onChange({
                  ...answer,
                  valueId: choice.id,
                });
              }
            }}
          >
            {choice.value}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Label className="flex cursor-pointer flex-col gap-2">
      <span className="text-base font-semibold">
        {index}.&nbsp;&nbsp;{question.questionContent}
      </span>
      {InputField}
    </Label>
  );
}
