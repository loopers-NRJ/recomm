"use client";
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { AccessType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

export default function AccordionSection({
  title,
  types,
  selectedRoles,
  handleCheckedChange,
}: {
  title: string;
  types: [AccessType, ...AccessType[]];
  selectedRoles: Set<AccessType>;
  handleCheckedChange: (
    checked: boolean,
    types: [AccessType, ...AccessType[]],
  ) => void | Promise<void>;
}) {
  return (
    <AccordionItem value={title}>
      <AccordionTrigger>
        <div className="flex items-center gap-2 font-bold">
          <Checkbox
            checked={types.every((type) => selectedRoles.has(type))}
            onClick={(e) => e.stopPropagation()}
            onCheckedChange={(checked) => {
              void handleCheckedChange(!!checked, types);
            }}
          />
          {title}
          <Badge>
            {[...selectedRoles].reduce((acc, curr) => {
              return acc + +types.includes(curr);
            }, 0)}
          </Badge>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pl-4">
        <div className="flex flex-col gap-2">
          {types.map((type) => (
            <Label className="flex items-center gap-2" key={type}>
              <Checkbox
                checked={selectedRoles.has(type)}
                onCheckedChange={(checked) => {
                  void handleCheckedChange(!!checked, [type]);
                }}
              />
              {type}
            </Label>
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
