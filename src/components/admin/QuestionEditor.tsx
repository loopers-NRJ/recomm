import { FC } from "react";
import { MultipleChoiceQuestionType, AtomicQuestionType } from "@prisma/client";
import { AllQuestionType, allQuestionTypes } from "@/types/prisma";
import {
  CheckBoxEditor,
  DropDownEditor,
  EditorProps,
  AtomicQuestionEditor,
  VariantEditor,
  RadioGroupEditor,
} from "./Editors";
import { Switch } from "@/components/ui/switch";
import { Button } from "../ui/button";
import { Cross1Icon } from "@radix-ui/react-icons";

interface QuestionEditorProps extends EditorProps {
  changeQuestionType: (newType: AllQuestionType) => void;
  deleteQuestion: () => void;
}

export const QuestionEditor: FC<QuestionEditorProps> = ({
  question,
  setQuestion,
  deleteQuestion,
  changeQuestionType,
  error,
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
    <div className="flex items-start gap-2">
      <Editor question={question} setQuestion={setQuestion} error={error} />
      <div className="flex items-center justify-center gap-2">
        <Switch
          checked={question.required}
          onCheckedChange={(checked) => {
            setQuestion({ ...question, required: checked });
          }}
          className="scale-90 data-[state=checked]:bg-red-400"
        />

        <select
          className="flex h-10 rounded-md border border-input bg-background py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => {
            changeQuestionType(e.target.value as AllQuestionType);
          }}
        >
          {allQuestionTypes.map((questionType) => (
            <option value={questionType} key={questionType}>
              {questionType}
            </option>
          ))}
        </select>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={deleteQuestion}
        >
          <Cross1Icon className="text-red-400" />
        </Button>
      </div>
    </div>
  );
};

export default QuestionEditor;
