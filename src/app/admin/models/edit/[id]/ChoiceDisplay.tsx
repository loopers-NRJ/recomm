"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type Question } from "./types";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { useState } from "react";

function ChoiceInput({ value: originalValue }: { value: string }) {
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState(originalValue);

  return (
    <>
      {enabled ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-fit w-fit"
          onBlur={() => {
            if (value.trim() === originalValue) {
              setEnabled(false);
            }
          }}
        />
      ) : (
        <Button
          variant="ghost"
          onClick={() => setEnabled(true)}
          className="min-w-[200px] justify-start"
        >
          {value}
        </Button>
      )}
      <Button variant="ghost" size="sm" title="Delete">
        <X className="text-red-400" />
      </Button>
      {value.trim() !== originalValue && (
        <Button variant="ghost" size="sm" title="Update">
          <Check />
        </Button>
      )}
    </>
  );
}

function VariantChoiceInput({ value: originalValue }: { value: string }) {
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState(originalValue);
  return (
    <div className="flex items-center gap-2">
      {enabled ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-fit w-fit"
          onBlur={() => {
            if (value.trim() === originalValue) {
              setEnabled(false);
            }
          }}
        />
      ) : (
        <Button
          role="button"
          variant="outline"
          className="min-w-[200px] justify-start"
          onClick={() => setEnabled(true)}
        >
          {value}
        </Button>
      )}
      <Button variant="ghost" size="sm" title="Delete">
        <X className="text-red-400" />
      </Button>
      {value.trim() !== originalValue && (
        <Button variant="ghost" size="sm" title="Update">
          <Check />
        </Button>
      )}
    </div>
  );
}

export function ChoiceDisplay({ question }: { question: Question }) {
  if (question.type === "Checkbox") {
    return (
      <div className="flex flex-col gap-1 ps-4">
        {question.choices.map((choice) => (
          <div key={choice.id} className="flex items-center gap-2">
            <Checkbox />
            <ChoiceInput value={choice.value} />
          </div>
        ))}
      </div>
    );
  }
  if (question.type === "Dropdown") {
    return (
      <div className="flex flex-col gap-1 ps-4">
        {question.choices.map((choice, index) => (
          <div key={choice.id} className="flex items-center gap-2">
            <span>{index + 1}.</span>
            <ChoiceInput value={choice.value} />
          </div>
        ))}
      </div>
    );
  }
  if (question.type === "RadioGroup") {
    return (
      <RadioGroup className="flex flex-col gap-1 ps-4">
        {question.choices.map((choice) => (
          <div key={choice.id} className="flex items-center gap-2">
            <RadioGroupItem value={choice.value} />
            <ChoiceInput value={choice.value} />
          </div>
        ))}
      </RadioGroup>
    );
  }
  if (question.type === "Variant") {
    return (
      <div className="flex flex-col gap-1 ps-4">
        {question.choices.map((choice) => (
          <VariantChoiceInput value={choice.value} key={choice.id} />
        ))}
      </div>
    );
  }
}
