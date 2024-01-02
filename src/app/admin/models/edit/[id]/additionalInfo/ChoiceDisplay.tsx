"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type MultipleChoiceQuestion } from "../types";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { useState } from "react";
import { api } from "@/trpc/react";
import { type Choice } from "@prisma/client";
import { Cross1Icon } from "@radix-ui/react-icons";

function ChoiceInput({
  choice,
  question,
  setQuestion,
}: {
  choice: Choice;
  question: MultipleChoiceQuestion;
  setQuestion: (newQuestion: MultipleChoiceQuestion) => void;
}) {
  const [enabled, setEnabled] = useState(false);
  const [value, setValue] = useState(choice.value);
  const deleteChoice = api.model.deleteChoice.useMutation();
  const updateChoice = api.model.updateChoice.useMutation();

  return (
    <>
      {enabled ? (
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-fit w-fit"
          onBlur={() => {
            if (value.trim() === choice.value) {
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
      <Button
        variant="ghost"
        size="sm"
        title="Delete"
        onClick={() => {
          deleteChoice
            .mutateAsync({ choiceId: choice.id })
            .then(() =>
              setQuestion({
                ...question,
                choices: question.choices.filter((ch) => ch.id !== choice.id),
              }),
            )
            .catch(console.error);
        }}
        disabled={deleteChoice.isLoading}
        className="h-6 w-6 p-0"
      >
        <Cross1Icon className="text-red-600" />
      </Button>
      {value.trim() !== choice.value && value.trim() !== "" && (
        <Button
          variant="ghost"
          size="sm"
          title="Update"
          disabled={updateChoice.isLoading}
          onClick={() => {
            updateChoice
              .mutateAsync({ choiceId: choice.id, value })
              .then((updatedChoice) =>
                setQuestion({
                  ...question,
                  choices: question.choices.map((choice) =>
                    choice.id === updatedChoice.id ? updatedChoice : choice,
                  ),
                }),
              )
              .catch(console.error);
          }}
        >
          <Check />
        </Button>
      )}
    </>
  );
}

export function ChoiceDisplay({
  question,
  setQuestion,
}: {
  question: MultipleChoiceQuestion;
  setQuestion: (newQuestion: MultipleChoiceQuestion) => void;
}) {
  if (question.choices.length === 0) return null;

  if (question.type === "Checkbox") {
    return (
      <div className="flex flex-col gap-1 ps-4">
        {question.choices.map((choice) => (
          <div key={choice.id} className="flex items-center gap-2">
            <Checkbox />
            <ChoiceInput
              choice={choice}
              question={question}
              setQuestion={setQuestion}
            />
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
            <ChoiceInput
              choice={choice}
              question={question}
              setQuestion={setQuestion}
            />
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
            <ChoiceInput
              choice={choice}
              question={question}
              setQuestion={setQuestion}
            />
          </div>
        ))}
      </RadioGroup>
    );
  }
  if (question.type === "Variant") {
    return (
      <div className="flex flex-col gap-1 ps-4">
        {question.choices.map((choice) => (
          <div className="flex w-fit items-center gap-2 ps-6" key={choice.id}>
            <ChoiceInput
              choice={choice}
              question={question}
              setQuestion={setQuestion}
            />
          </div>
        ))}
      </div>
    );
  }
}
