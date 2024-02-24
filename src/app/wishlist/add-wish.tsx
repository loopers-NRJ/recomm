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
import { Drawer, DrawerClose, DrawerContent, DrawerFooter, DrawerHeader, DrawerTrigger } from "@/components/ui/drawer";
import { useRouter } from "next/navigation";

function AddWish() {
  const [selectedCategory, setSelectedCategory] = useState<OptionalItem>();
  const [selectedBrand, setSelectedBrand] = useState<OptionalItem>();
  const [selectedModel, setSelectedModel] = useState<OptionalItem>();
  const [upperBound, setUpperbound] = useState<string>();
  const [lowerBound, setLowerbound] = useState<string>();
  const router = useRouter()
  const { mutateAsync: createWish } = api.wish.create.useMutation();

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

      if (lowerBound === undefined || upperBound === undefined) {
        return toast.error("Enter the price range");
      }

      const result = await createWish({
        modelId: selectedModel.id,
        lowerBound: +lowerBound,
        upperBound: +upperBound,
      });

      if (typeof result === "string") {
        toast.success(result);
      }
      else {
        toast.success("Wish added successfully");
      }
      router.refresh();
    } catch (error) {
      if (error instanceof Error)
        return toast.error(error.message);
      else
        return toast.error(error as string);
    }
  };
  return (
    <Drawer>
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
            <Input value={lowerBound}
              className="lowerBound" 
              type="number" 
              onChange={(event) => setLowerbound(event.target.value)}
              placeholder="Starting price" />
            <Input 
              value={upperBound}
              onChange={(event) => setUpperbound(event.target.value)} 
              className="upperBound" 
              type="number" 
              placeholder="Ending price" />
          </Label>
        </div>
        <DrawerFooter className="flex flex-row">
          <Button className="w-full" onClick={() => void handleClick()}>Add to List</Button>
          <DrawerClose className="w-full px-4 py-2 bg-secondary border rounded-lg text-sm font-medium">Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AddWish;
