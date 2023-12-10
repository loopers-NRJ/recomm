import { AtomicQuestion, AtomicQuestionType } from "@prisma/client";
import { Input } from "../ui/input";
import DatePicker from "../common/DatePicker";
import { type ReactNode } from "react";
import { Label } from "../ui/label";
import Textarea from "../ui/Textarea";

export type AtomicAnswer =
  | {
      type: "Text" | "Paragraph";
      questionId: string;
      answerContent: string;
    }
  | {
      type: "Number";
      questionId: string;
      answerContent: number;
    }
  | {
      type: "Date";
      questionId: string;
      answerContent: Date | undefined;
    };

interface AtomicQuestionInputFieldProps {
  question: AtomicQuestion;
  answer: AtomicAnswer;
  onChange: (value: AtomicAnswer) => void;
  index?: number;
}

export default function AtomicQuestionInputField({
  question,
  onChange,
  index,
  answer,
}: AtomicQuestionInputFieldProps) {
  let InputField: ReactNode;
  if (
    question.type === AtomicQuestionType.Text &&
    answer.type === AtomicQuestionType.Text
  ) {
    InputField = (
      <Input
        type="text"
        value={answer.answerContent}
        onChange={(e) => onChange({ ...answer, answerContent: e.target.value })}
        placeholder="Enter your answer"
      />
    );
  }

  if (
    question.type === AtomicQuestionType.Paragraph &&
    answer.type === AtomicQuestionType.Paragraph
  ) {
    InputField = (
      <Textarea
        value={answer.answerContent}
        onChange={(e) => onChange({ ...answer, answerContent: e.target.value })}
        placeholder="Enter your answer"
      />
    );
  }

  if (
    question.type === AtomicQuestionType.Number &&
    answer.type === AtomicQuestionType.Number
  ) {
    InputField = (
      <Input
        type="number"
        value={answer.answerContent}
        onChange={(e) => {
          if (isNaN(+e.target.value)) return;
          onChange({ ...answer, answerContent: +e.target.value });
        }}
        placeholder="Enter your answer"
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
          onChange({ ...answer, answerContent: date });
        }}
      />
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
