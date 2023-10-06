import { FC } from "react";

import { Button } from "@/components/ui/button";
import { MultipleChoiceQuestionPayloadIncluded } from "@/types/prisma";

import { Label } from "../ui/label";

export interface VariantSelectorProps {
  question: MultipleChoiceQuestionPayloadIncluded;
  selectedVariantId?: string;
  setSelectedVariantId: (optionId: string, valueId: string) => void;
  requiredError: boolean;
}

export const VariantSelector: FC<VariantSelectorProps> = ({
  question,
  selectedVariantId,
  setSelectedVariantId,
  requiredError,
}) => {
  return (
    <div className="mt-3 flex flex-col items-start justify-between gap-2">
      <Label>{question.questionContent}</Label>
      <div className="flex flex-wrap gap-1 sm:gap-3">
        {question.choices.map((choice) => (
          <Button
            role="button"
            key={choice.id}
            className={`border ${
              selectedVariantId === choice.id ? "bg-slate-200" : ""
            } ${requiredError ? "border-red-500" : ""}`}
            variant="ghost"
            onClick={() => {
              // setSelectedVariantId(option.id, value.id);
              // page is reloading when I click on the button why ?
              if (!selectedVariantId) {
                setSelectedVariantId(question.id, choice.id);
              } else if (selectedVariantId === choice.id) {
                setSelectedVariantId(
                  question.id,
                  undefined as unknown as string
                );
              } else {
                setSelectedVariantId(question.id, choice.id);
              }
            }}
          >
            {choice.value}
          </Button>
        ))}
      </div>
    </div>
  );
};
