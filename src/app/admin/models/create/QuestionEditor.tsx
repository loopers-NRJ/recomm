import { Switch } from "@/components/ui/switch";
import { allQuestionTypes, type AllQuestionType } from "@/types/prisma";
import { AtomicQuestionType, MultipleChoiceQuestionType } from "@prisma/client";
import { type FC } from "react";
import { Button } from "@/components/ui/button";
import {
  AtomicQuestionEditor,
  CheckBoxEditor,
  DropDownEditor,
  RadioGroupEditor,
  VariantEditor,
  type EditorProps,
} from "./Editors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Cross1Icon } from "@radix-ui/react-icons";

interface QuestionEditorProps extends EditorProps {
  changeQuestionType: (newType: AllQuestionType) => void;
  deleteQuestion: () => void;
  className?: string;
}

export const QuestionEditor: FC<QuestionEditorProps> = ({
  question,
  setQuestion,
  deleteQuestion,
  changeQuestionType,
  error,
  className,
}) => {
  // create UI based on the question type
  let Editor: FC<EditorProps>;
  switch (question.type) {
    case AtomicQuestionType.Text:
    case AtomicQuestionType.Paragraph:
    case AtomicQuestionType.Date:
    case AtomicQuestionType.Number:
      Editor = AtomicQuestionEditor;
      break;
    case MultipleChoiceQuestionType.Variant:
      Editor = VariantEditor;
      break;
    case MultipleChoiceQuestionType.Dropdown:
      Editor = DropDownEditor;
      break;
    case MultipleChoiceQuestionType.Checkbox:
      Editor = CheckBoxEditor;
      break;
    case MultipleChoiceQuestionType.RadioGroup:
      Editor = RadioGroupEditor;
      break;
  }

  return (
    <div className={cn("flex items-start gap-2", className)}>
      <Editor question={question} setQuestion={setQuestion} error={error} />
      <div className="flex items-center justify-center gap-2">
        <Switch
          title="Required"
          checked={question.required}
          onCheckedChange={(checked) => {
            setQuestion({ ...question, required: checked });
          }}
          className="scale-90 data-[state=checked]:bg-red-400"
        />

        <Select
          value={question.type}
          onValueChange={(value) => {
            changeQuestionType(value as AllQuestionType);
          }}
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
        <Button
          size="sm"
          variant="ghost"
          onClick={deleteQuestion}
          className="h-6 w-6 p-0"
        >
          <Cross1Icon className="text-red-600" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditor;
