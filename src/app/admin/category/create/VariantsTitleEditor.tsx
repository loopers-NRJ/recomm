"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export type VariantsList = [string, ...string[]];

export default function VariantsTitleEditor({
  values,
  setValues,
}: {
  values: VariantsList | undefined;
  setValues: (newValues?: VariantsList) => void;
}) {
  const [search, setSearch] = useState("");

  return (
    <div className="w-full">
      <Label>Enter optional variant names</Label>
      <div>
        <div className="flex flex-wrap gap-2 py-1">
          {values?.map((item, index) => (
            <Button
              key={item}
              onClick={() => {
                const newValues: VariantsList = [...values];
                newValues.splice(index, 1);
                if (newValues.length === 0) {
                  setValues();
                } else {
                  setValues(newValues);
                }
              }}
              variant="ghost"
              className="h-8 w-fit border px-2"
              size="default"
            >
              {item}
            </Button>
          ))}
        </div>
        <Label className="flex items-center gap-2">
          <Input
            type="text"
            // decrease the height of the input
            placeholder="Enter the choice and press `Enter Key`"
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim().length > 0) {
                let newValues: VariantsList;
                if (values) {
                  newValues = [...values, search.trim()];
                } else {
                  newValues = [search.trim()];
                }
                setValues(newValues);
                setSearch("");
              }
            }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Label>
      </div>
    </div>
  );
}
