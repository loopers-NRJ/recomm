"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type OptionalItem } from "@/types/custom";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import CategoryComboBox from "@/components/combobox/CategoryComboBox";
import BrandComboBox from "@/components/combobox/BrandComboBox";
import ModelComboBox from "@/components/combobox/ModelComboBox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { errorHandler } from "@/utils/errorHandler";

function AddWish() {
  const [selectedCategory, setSelectedCategory] = useState<OptionalItem>();
  const [selectedBrand, setSelectedBrand] = useState<OptionalItem>();
  const [selectedModel, setSelectedModel] = useState<OptionalItem>();
  const [upperBound, setUpperbound] = useState<string>("");
  const [lowerBound, setLowerbound] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const router = useRouter();
  const { mutate: createWish, isLoading } = api.wish.create.useMutation({
    onSuccess: (result) => {
      if (typeof result === "string") {
        toast.error(result);
      } else {
        setIsOpen(false);
        router.refresh();
        toast.success("Wish added successfully");
      }
    },
    onError: errorHandler,
  });

  const handleClick = async () => {
    try {
      if (selectedCategory === undefined) {
        return toast.error("Select the Category");
      }

      if (selectedBrand === undefined) {
        return toast.error("Select the Brand");
      }

      if (selectedModel === undefined) {
        return toast.error("Select the Model");
      }

      if (lowerBound === "" || upperBound === "") {
        return toast.error("Enter the price range");
      }

      if (+lowerBound > +upperBound) {
        return toast.error("Lower bound should be less than upper bound");
      }

      if (+lowerBound === 0 || +upperBound === 0) {
        return toast.error("Price input should be non zero");
      }

      createWish({
        modelId: selectedModel.id,
        lowerBound: +lowerBound,
        upperBound: +upperBound,
      });
    } catch (error) {
      if (error instanceof Error) return toast.error(error.message);
      else return toast.error(error as string);
    }
  };
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button size="sm">Create a Wish</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <h1 className="font-bold">Edit Wish Details</h1>
          <span className="text-muted-foreground">
            Enter details below to Add a Product Wish.
          </span>
        </DrawerHeader>
        <div className="grid gap-4 px-5">
          <CategoryComboBox
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
          <BrandComboBox
            selected={selectedBrand}
            onSelect={setSelectedBrand}
            categoryId={selectedCategory?.id}
          />
          <ModelComboBox
            selected={selectedModel}
            onSelect={setSelectedModel}
            brandId={selectedBrand?.id}
            categoryId={selectedCategory?.id}
          />
          <Label className="flex w-full space-x-2">
            <Input
              value={lowerBound}
              className="lowerBound"
              type="number"
              onChange={(event) => setLowerbound(event.target.value)}
              placeholder="Starting price"
            />
            <Input
              value={upperBound}
              onChange={(event) => setUpperbound(event.target.value)}
              className="upperBound"
              type="number"
              placeholder="Ending price"
            />
          </Label>
        </div>
        <DrawerFooter className="flex flex-row">
          <Button className="w-full" onClick={() => void handleClick()}>
            {isLoading && <Loader2 className="mx-1 animate-spin" />}
            Add to List
          </Button>
          <DrawerClose className="w-full rounded-lg border bg-secondary px-4 py-2 text-sm font-medium">
            Close
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default AddWish;
