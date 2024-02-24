"use client";

import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Slider } from "./_components/slider";
import { type OptionalItem } from "@/types/custom";
import { api } from "@/trpc/react";
import toast from "react-hot-toast";
import CategoryComboBox from "@/components/combobox/CategoryComboBox";
import BrandComboBox from "@/components/combobox/BrandComboBox";
import ModelComboBox from "@/components/combobox/ModelComboBox";

const AddWish: FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<OptionalItem>();
  const [selectedBrand, setSelectedBrand] = useState<OptionalItem>();
  const [selectedModel, setSelectedModel] = useState<OptionalItem>();
  const [sliderValue, setSliderValue] = useState<number[]>([30, 70]);

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

      const result = await createWish({
        modelId: selectedModel.id,
        lowerBound: sliderValue[0]!,
        upperBound: sliderValue[1]!,
      });

      console.log(result);

      // TODO: navigate to the wish list page
    } catch (error) {
      console.log(error);
      return toast.error("Something went wrong");
    }
  };
  return (
    <Dialog modal>
      <DialogTrigger asChild>
        {/* Plus icon */}
        <div className="flex aspect-square w-10  items-center justify-center rounded-lg bg-black text-5xl text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </div>
      </DialogTrigger>
      <DialogContent className="w-[350px] md:w-full">
        <DialogHeader>
          <DialogTitle>Edit Wish Details</DialogTitle>
          <DialogDescription>
            Enter details below to Add a Product Wish.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
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
          <Slider defaultValue={sliderValue} onChange={setSliderValue} />
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => void handleClick()}>
            Add to List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddWish;
