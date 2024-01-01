"use client";
import { allQuestionTypes, type AllQuestionType } from "@/types/prisma";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function QuestionTypeSelect({
  type,
  setType,
}: {
  type: AllQuestionType;
  setType: (newType: AllQuestionType) => void;
}) {
  return (
    <Select
      onValueChange={(value) => setType(value as AllQuestionType)}
      value={type}
    >
      <SelectTrigger className="w-[200px] shrink-0">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {allQuestionTypes.map((type) => (
          <SelectItem value={type} key={type}>
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
