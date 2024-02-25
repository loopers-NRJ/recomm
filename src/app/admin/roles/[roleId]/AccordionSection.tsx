"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { AccessType } from "@prisma/client";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export type Processing =
  | { action: "adding" | "removing"; types: [AccessType, ...AccessType[]] }
  | false;

export default function AccordionSection({
  title,
  types,
  processing,
  selectedRoles,
  handleCheckedChange,
}: {
  title: string;
  types: [AccessType, ...AccessType[]];
  selectedRoles: AccessType[];
  processing: Processing;
  handleCheckedChange: (
    checked: boolean,
    types: [AccessType, ...AccessType[]],
  ) => void | Promise<void>;
}) {

  /**
   * This is a temporary solution to prevent hydration error:
   * Using Checkbox inside AccordionSection cause hydration error in nextjs
   * follow this issue: https://github.com/shadcn-ui/ui/issues/1273
   */
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return null;
  return (
    <AccordionItem value={title}>
      <AccordionTrigger>
        <div className="flex items-center gap-2 font-bold">
          <Checkbox
            checked={types.every((type) => selectedRoles.includes(type))}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(checked) => {
              void handleCheckedChange(!!checked, types);
            }}
            disabled={processing !== false}
          />
          {title}
          <Badge>
            {selectedRoles.reduce((acc, curr) => {
              return acc + +types.includes(curr);
            }, 0)}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-4">
        <div className="flex flex-col gap-2">
          {types.map((type) => (
            <Label className="flex items-center gap-2" key={type}>
              {processing &&
              processing.types.includes(type) &&
              ((processing.action === "adding" &&
                !selectedRoles.includes(type)) ||
                (processing.action === "removing" &&
                  selectedRoles.includes(type))) ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Checkbox
                  checked={selectedRoles.includes(type)}
                  onCheckedChange={(checked) => {
                    void handleCheckedChange(!!checked, [type]);
                  }}
                  disabled={processing !== false}
                />
              )}
              {type}
            </Label>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
