"use client";

import Textarea from "@/components/common/Textarea";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { api } from "@/trpc/react";
import { idSchema } from "@/utils/validation";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

function ReportButton({ id }: { id: string }) {
  const { mutate: createReport, isLoading } = api.report.create.useMutation();

  const shape = z.object({
    productId: idSchema,
    description: z.string().trim().min(1),
  });

  const [text, setText] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const report = () => {
    try {
      const data = shape.parse({ productId: id, description: text });
      try {
        createReport(data);
        toast.success("Reported Successfully");
        setIsOpen(false);
        setText("");
      } catch (err) {
        if (typeof err === "string") toast.error(err);
        else {
          toast.error("Failed to report Ad");
          setIsOpen(false);
          setText("");
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      }
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="link"
          size="sm"
          className="text-xs font-light text-gray-500"
        >
          Report this Ad
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-5">
        <DrawerHeader>
          <DrawerTitle>Report this Ad</DrawerTitle>
        </DrawerHeader>
        <Textarea
          onChange={(e) => setText(e.target.value)}
          value={text}
          className="my-3 w-full p-3"
          placeholder="Tell us why you think this ad should be removed"
        />
        <DrawerFooter className="flex-row p-0">
          <Button variant="destructive" onClick={report} className="w-full">
            {isLoading && <Loader2 className="mx-1 animate-spin" />}
            Report
          </Button>
          <DrawerClose asChild>
            <Button variant="default" className="w-full">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default ReportButton;
