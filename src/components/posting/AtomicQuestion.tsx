import { type AtomicQuestion, AtomicQuestionType } from "@prisma/client";
import { Input } from "../ui/input";
import DatePicker from "../common/DatePicker";
import { type ReactNode } from "react";
import { Label } from "../ui/label";
import Textarea from "../common/Textarea";
import { type ZodIssue } from "zod";
import ErrorMessage from "../common/ErrorMessage";

export type AtomicAnswer = {
  questionId: string;
} & (
  | {
      required: true;
      type: "Text" | "Paragraph";
      answerContent: string;
    }
  | {
      required: false;
      type: "Text" | "Paragraph";
      answerContent: string | undefined;
    }
  | {
      required: true;
      type: "Number";
      answerContent: number;
    }
  | {
      required: false;
      type: "Number";
      answerContent: number | undefined;
    }
  | {
      required: true;
      type: "Date";
      answerContent: Date;
    }
  | {
      required: false;
      type: "Date";
      answerContent: Date | undefined;
    }
);

interface AtomicQuestionInputFieldProps {
  question: AtomicQuestion;
  answer: AtomicAnswer;
  onChange: (value: AtomicAnswer) => void;
  index?: number;
  error: ZodIssue | undefined;
}

export default function AtomicQuestionInputField({
  question,
  onChange,
  index,
  answer,
  error,
}: AtomicQuestionInputFieldProps) {
  let InputField: ReactNode;
  if (
    question.type === AtomicQuestionType.Text &&
    answer.type === AtomicQuestionType.Text
  ) {
    InputField = (
      <Input
        type="text"
        value={answer.answerContent ?? ""}
        onChange={(e) => onChange({ ...answer, answerContent: e.target.value })}
        placeholder="Enter your answer"
        className={error ? "border-red-500" : ""}
      />
    );
  }

  if (
    question.type === AtomicQuestionType.Paragraph &&
    answer.type === AtomicQuestionType.Paragraph
  ) {
    InputField = (
      <Textarea
        value={answer.answerContent ?? ""}
        onChange={(e) => onChange({ ...answer, answerContent: e.target.value })}
        placeholder="Enter your answer"
        className={error ? "border-red-500" : ""}
      />
    );
  }

  if (
    question.type === AtomicQuestionType.Number &&
    answer.type === AtomicQuestionType.Number
  ) {
    InputField = (
      <Input
        type="string"
        value={`${answer.answerContent === 0 ? "" : answer.answerContent}`}
        onChange={(e) => {
          if (isNaN(+e.target.value)) return;
          onChange({ ...answer, answerContent: +e.target.value });
        }}
        placeholder="Enter your answer"
        className={error ? "border-red-500" : ""}
      />
    );
  }

  if (
    question.type === AtomicQuestionType.Date &&
    answer.type === AtomicQuestionType.Date
  ) {
    InputField = (
      <DatePicker
        date={answer.answerContent}
        setDate={(date) => {
          if (!date) return;
          onChange({ ...answer, answerContent: date });
        }}
        requiredError={!!error}
      />
    );
  }

  return (
    <Label className="flex cursor-pointer flex-col gap-2">
      <span className="text-base font-semibold">
        {index}.&nbsp;&nbsp;{question.questionContent}
        {question.required && <span className="text-red-500">{" * "}</span>}
      </span>
      {InputField}
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
    </Label>
  );
}
