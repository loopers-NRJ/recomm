"use client";

import { FC, useState } from "react";

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
import { FetchItems, OptionalItem } from "@/types/custom";
import { api } from "@/utils/api";

import ComboBox from "./common/ComboBox";
import { toast } from "./ui/use-toast";

const AddWish: FC = () => {
  const [searchCategory, setSearchCategory] = useState("");
  const categoryApi = api.search.category.useQuery({
    search: searchCategory,
  });
  const [selectedCategory, setSelectedCategory] = useState<OptionalItem>();

  const [searchBrand, setSearchBrand] = useState("");
  const brandApi = api.search.brands.useQuery({
    categoryId: selectedCategory?.id,
    search: searchBrand,
  });
  const [selectedBrand, setSelectedBrand] = useState<OptionalItem>();

  const [searchModel, setSearchModel] = useState("");
  const modelApi = api.search.models.useQuery({
    brandId: selectedBrand?.id,
    search: searchModel,
  });
  const [selectedModel, setSelectedModel] = useState<OptionalItem>();

  const { mutateAsync: createWish } = api.wish.createWish.useMutation();

  if (
    categoryApi.data instanceof Error ||
    brandApi.data instanceof Error ||
    modelApi.data instanceof Error
  ) {
    const error =
      categoryApi.data instanceof Error
        ? categoryApi.data
        : brandApi.data instanceof Error
        ? brandApi.data
        : modelApi.data instanceof Error
        ? modelApi.data
        : null;
    toast({
      title: "Error",
      description: error?.message,
      variant: "destructive",
    });
    return;
  }

  const handleClick = async () => {
    try {
      if (selectedCategory === undefined) {
        return toast({
          title: "Error",
          description: "Select the Category",
          variant: "destructive",
        });
      }

      if (selectedBrand === undefined) {
        return toast({
          title: "Error",
          description: "Select the Brand",
          variant: "destructive",
        });
      }

      if (selectedModel === undefined) {
        return toast({
          title: "Error",
          description: "Select the Model",
          variant: "destructive",
        });
      }

      // TODO: @naveen create uito get the lower and upper bound
      const result = await createWish({
        modelId: selectedModel.id,
        lowerBound: 0,
        upperBound: 0,
      });
      if (result instanceof Error) {
        return toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      // TODO: navigate to the wish list page
    } catch (error) {
      console.log(error);
      return toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
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
          <div className="flex justify-between">
            Category
            <ComboBox
              label="Category"
              selected={selectedCategory}
              onSelect={(category) => setSelectedCategory(category)}
              fetchItems={api.search.category.useQuery as FetchItems}
              fetchInput={{ search: searchCategory }}
              value={searchCategory}
              onChange={(value) => setSearchCategory(value)}
            />
          </div>
          <div className="flex justify-between">
            Brand
            <ComboBox
              label="Brand"
              selected={selectedBrand}
              onSelect={(brand) => setSelectedBrand(brand)}
              fetchItems={api.search.brands.useQuery as FetchItems}
              fetchInput={{
                categoryId: selectedCategory?.id,
                search: searchBrand,
              }}
              value={searchBrand}
              onChange={(value) => setSearchBrand(value)}
            />
          </div>
          <div className="flex justify-between">
            Model
            <ComboBox
              label="Model"
              selected={selectedModel}
              onSelect={(model) => setSelectedModel(model)}
              fetchItems={api.search.models.useQuery as FetchItems}
              fetchInput={{
                brandId: selectedBrand?.id,
                search: searchModel,
              }}
              value={searchModel}
              onChange={(value) => setSearchModel(value)}
            />
          </div>
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
