import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type Question } from "@/types/custom";
import { MultipleChoiceQuestionType } from "@prisma/client";
import { Cross1Icon } from "@radix-ui/react-icons";
import { useState, type FC } from "react";
import { type ZodIssue } from "zod";

export interface EditorProps {
  question: Question;
  setQuestion: (updated: Question) => void;
  error?: ZodIssue;
}

export const AtomicQuestionEditor: FC<EditorProps> = ({
  question,
  setQuestion,
  error,
}) => {
  return (
    <div className="w-full">
      <Label>
        <Input
          value={question.questionContent}
          onChange={(e) =>
            setQuestion({ ...question, questionContent: e.target.value })
          }
          placeholder="Enter your Question"
          className={error ? "border-red-500" : ""}
        />
      </Label>
    </div>
  );
};

export const VariantEditor: FC<EditorProps> = ({
  question,
  setQuestion,
  error,
}) => {
  const [search, setSearch] = useState("");
  if (question.type !== MultipleChoiceQuestionType.Variant) {
    return null;
  }
  return (
    <div className="flex w-full flex-col gap-1">
      <Input
        value={question.questionContent}
        onChange={(e) =>
          setQuestion({ ...question, questionContent: e.target.value })
        }
        placeholder="Question"
        className={error?.path[2] === "questionContent" ? "border-red-500" : ""}
      />
      <div
        className={`flex w-full flex-grow flex-wrap items-center gap-1 rounded-lg border border-input bg-background p-1
      ${
        error?.path[2] === "choices" && question.choices.length === 0
          ? "border-red-500"
          : ""
      }
      `}
      >
        {question.choices.map((item, index) => (
          <Button
            key={item}
            onClick={() => {
              const newChoices = [...question.choices];
              newChoices.splice(index, 1);
              setQuestion({ ...question, choices: newChoices });
            }}
            variant="ghost"
            className="h-8 w-fit border px-2"
            size="default"
          >
            {item}
          </Button>
        ))}
        <Input
          type="text"
          className="w-12 flex-grow border-none outline-none ring-0 focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0 focus-visible:ring-offset-transparent"
          value={search}
          placeholder="Enter the choice and press `Comma`"
          onKeyUp={(e) => {
            if (e.key === "Backspace" && search.length === 0) {
              const newChoices = [...question.choices];
              setSearch(newChoices.pop() ?? "");
              setQuestion({ ...question, choices: newChoices });
            }
          }}
          onChange={(e) => {
            const text = e.target.value;

            if (
              text.endsWith(",") &&
              search.trim().length > 0 &&
              question.choices.includes(search.trim()) === false
            ) {
              setQuestion({
                ...question,
                choices: [...question.choices, search.trim()],
              });
              setSearch("");
            } else {
              setSearch(text);
            }
          }}
        />
      </div>
    </div>
  );
};

export const DropDownEditor: FC<EditorProps> = ({
  question,
  setQuestion,
  error,
}) => {
  const [search, setSearch] = useState("");
  if (question.type !== MultipleChoiceQuestionType.Dropdown) {
    return null;
  }

  return (
    <div className="w-full">
      <Label>
        <Input
          value={question.questionContent}
          onChange={(e) =>
            setQuestion({ ...question, questionContent: e.target.value })
          }
          placeholder="Enter your Question"
          className={
            error?.path[2] === "questionContent" ? "border-red-500" : ""
          }
        />
      </Label>
      <div>
        <div className="flex flex-col gap-2 py-1">
          {question.choices.map((item, index) => (
            <div key={item} className="ml-4 flex items-center justify-between">
              <Label className="flex gap-2">
                <span>{index + 1}. </span>
                <span>{item}</span>
              </Label>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => {
                  const newValues = [...question.choices];
                  newValues.splice(index, 1);
                  setQuestion({ ...question, choices: newValues });
                }}
              >
                <Cross1Icon />
              </Button>
            </div>
          ))}
        </div>
        <Label className="flex items-center gap-2">
          <Input
            type="text"
            // decrease the height of the input
            placeholder="Enter the choice and press `Enter Key`"
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim().length > 0) {
                setQuestion({
                  ...question,
                  choices: [...question.choices, search.trim()],
                });
                setSearch("");
              }
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={
              error?.path[2] === "choices" && question.choices.length === 0
                ? "border-red-500"
                : ""
            }
          />
        </Label>
      </div>
    </div>
  );
};

export const CheckBoxEditor: FC<EditorProps> = ({
  question,
  setQuestion,
  error,
}) => {
  // similar to dropdown but with multiple selection allowed
  const [search, setSearch] = useState("");
  if (question.type !== MultipleChoiceQuestionType.Checkbox) {
    return null;
  }
  return (
    <div className="w-full">
      <Label>
        <Input
          value={question.questionContent}
          onChange={(e) =>
            setQuestion({ ...question, questionContent: e.target.value })
          }
          placeholder="Enter your Question"
          className={
            error?.path[2] === "questionContent" ? "border-red-500" : ""
          }
        />
      </Label>
      <div>
        <div className="flex flex-col gap-2 py-1">
          {question.choices.map((choice, index) => (
            <div
              key={choice}
              className="ml-4 flex items-center justify-between"
            >
              <Label>
                <div className="flex gap-2">
                  <Checkbox />
                  {choice}
                </div>
              </Label>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => {
                  const newValues = [...question.choices];
                  newValues.splice(index, 1);
                  setQuestion({ ...question, choices: newValues });
                }}
              >
                <Cross1Icon />
              </Button>
            </div>
          ))}
        </div>

        <Label className="flex items-center gap-2">
          <Input
            type="text"
            // decrease the height of the input
            placeholder="Enter the choice and press `Enter Key`"
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim().length > 0) {
                setQuestion({
                  ...question,
                  choices: [...question.choices, search.trim()],
                });
                setSearch("");
              }
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={
              error?.path[2] === "choices" && question.choices.length === 0
                ? "border-red-500"
                : ""
            }
          />
        </Label>
      </div>
    </div>
  );
};

export const RadioGroupEditor: FC<EditorProps> = ({
  question,
  setQuestion,
  error,
}) => {
  const [search, setSearch] = useState("");
  if (question.type !== MultipleChoiceQuestionType.RadioGroup) {
    return null;
  }
  return (
    <div className="w-full">
      <Label>
        <Input
          value={question.questionContent}
          onChange={(e) =>
            setQuestion({ ...question, questionContent: e.target.value })
          }
          placeholder="Enter your Question"
          className={
            error?.path[2] === "questionContent" ? "border-red-500" : ""
          }
        />
      </Label>
      <div>
        <RadioGroup className="flex flex-col gap-2 py-1">
          {question.choices.map((choice, index) => (
            <div
              key={choice}
              className="ml-4 flex items-center justify-between"
            >
              <Label className="flex gap-2">
                <RadioGroupItem value={choice} />
                <span>{choice}</span>
              </Label>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => {
                  const newValues = [...question.choices];
                  newValues.splice(index, 1);
                  setQuestion({ ...question, choices: newValues });
                }}
              >
                <Cross1Icon />
              </Button>
            </div>
          ))}
        </RadioGroup>
        <Label className="flex items-center gap-2">
          <Input
            type="text"
            // decrease the height of the input
            placeholder="Enter the choice and press `Enter Key`"
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim().length > 0) {
                setQuestion({
                  ...question,
                  choices: [...question.choices, search.trim()],
                });
                setSearch("");
              }
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={
              error?.path[2] === "choices" && question.choices.length === 0
                ? "border-red-500"
                : ""
            }
          />
        </Label>
      </div>
    </div>
  );
};
