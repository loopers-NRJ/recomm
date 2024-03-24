"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Loader2 } from "lucide-react";
import { type ComponentProps, useState } from "react";

export default function EditableText({
  value,
  onSubmit,
  disabled,
  loading,
  type,
}: {
  value: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  type?: ComponentProps<"input">["type"];
}) {
  const [status, setStatus] = useState<"closed" | "open">("closed");
  const [internalValue, setInternalValue] = useState(value);

  return (
    <Label className="flex items-center justify-between gap-2">
      {status === "closed" ? (
        <Button
          variant="outline"
          onClick={() => setStatus("open")}
          className="min-w-20"
          disabled={disabled ?? loading}
        >
          {value}
        </Button>
      ) : (
        <div className="flex items-center justify-center gap-2">
          <Input
            placeholder="Enter"
            value={internalValue}
            onChange={(e) => {
              setInternalValue(e.target.value);
            }}
            onBlur={() => {
              if (internalValue === "" || internalValue === value) {
                setStatus("closed");
              }
            }}
            disabled={disabled ?? loading}
            type={type}
          />
          {internalValue && internalValue !== value && (
            <Button
              variant="ghost"
              size="sm"
              title="Apply"
              onClick={() => onSubmit(internalValue)}
              disabled={disabled ?? loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <Check />}
            </Button>
          )}
        </div>
      )}
    </Label>
  );
}
