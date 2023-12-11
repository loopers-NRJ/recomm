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
import { MultipleChoiceQuestionType } from "@prisma/client";
import { Button } from "../ui/button";
import { ZodIssue } from "zod";
import ErrorMessage from "../common/ErrorMessage";

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
  error: ZodIssue | undefined;
}
export default function MultipleChoiceQuestionInputField({
  question,
  answer,
  onChange,
  index,
  error,
}: MultipleChoiceQuestionInputFieldProps) {
  if (
    question.type === MultipleChoiceQuestionType.Checkbox &&
    answer.type === MultipleChoiceQuestionType.Checkbox
  ) {
    return (
      <div>
        <Label className="flex flex-col gap-2">
          <span className="text-base font-semibold">
            {index}.&nbsp;&nbsp;{question.questionContent}
          </span>
        </Label>

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
                      valueIds: answer.valueIds.filter(
                        (id) => id !== choice.id
                      ),
                    });
                  }
                }}
                className={error ? "border-red-500" : ""}
              />
              {choice.value}
            </Label>
          ))}
        </div>
        {error && <ErrorMessage>{error.message}</ErrorMessage>}
      </div>
    );
  }
  if (
    question.type === MultipleChoiceQuestionType.Dropdown &&
    answer.type === MultipleChoiceQuestionType.Dropdown
  ) {
    return (
      <Label className="flex flex-col gap-2">
        <span className="text-base font-semibold">
          {index}.&nbsp;&nbsp;{question.questionContent}
        </span>
        <Select
          onValueChange={(value) => {
            onChange({
              ...answer,
              valueId: value,
            });
          }}
        >
          <SelectTrigger
            className={`ms-4 w-[180px] ${error ? "border-red-500" : ""}`}
          >
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
        {error && <ErrorMessage>{error.message}</ErrorMessage>}
      </Label>
    );
  }

  if (
    question.type === MultipleChoiceQuestionType.RadioGroup &&
    answer.type === MultipleChoiceQuestionType.RadioGroup
  ) {
    return (
      <div className="flex flex-col gap-2">
        <Label>
          <span className="text-base font-semibold">
            {index}.&nbsp;&nbsp;{question.questionContent}
          </span>
        </Label>

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
                className={error ? "border-red-500" : ""}
              />
              {choice.value}
            </Label>
          ))}
        </RadioGroup>
        {error && <ErrorMessage>{error.message}</ErrorMessage>}
      </div>
    );
  }

  if (
    question.type === MultipleChoiceQuestionType.Variant &&
    answer.type === MultipleChoiceQuestionType.Variant
  ) {
    return (
      <Label className="flex flex-col gap-2">
        <span className="text-base font-semibold">
          {index}.&nbsp;&nbsp;{question.questionContent}
        </span>
        <div className="flex flex-wrap gap-1 ps-4 sm:gap-3">
          {question.choices.map((choice) => (
            <Button
              role="button"
              key={choice.id}
              className={`border ${
                answer.valueId === choice.id ? "bg-slate-200" : ""
              } 
            ${error ? "border-red-500" : "border-slate-300"}
            `}
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
        {error && <ErrorMessage>{error.message}</ErrorMessage>}
      </Label>
    );
  }

  return null;
}
