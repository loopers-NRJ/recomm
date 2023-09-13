"use client";

import { FC, useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";

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
import { OptionalItem } from "@/types/item";
import { api } from "@/utils/api";

import ComboBox from "./common/ComboBox";
import { useToast } from "./ui/use-toast";

const AddWish: FC = () => {
  const [searchCategory, setSearchCategory] = useState("");
  const categoryApi = api.search.category.useQuery({
    search: searchCategory,
  });
  const [selectedCategory, setSelectedCategory] = useState<OptionalItem>();

  // TODO: hardcoded default category id `cllrwmem20005ua9k3cxywefx`
  // this id is for Electronics Category.
  const [searchBrand, setSearchBrand] = useState("");
  const brandApi = api.search.brands.useQuery({
    categoryId:
      selectedCategory === undefined
        ? "cllrwmem20005ua9k3cxywefx"
        : selectedCategory.id,
    search: searchBrand,
  });
  const [selectedBrand, setSelectedBrand] = useState<OptionalItem>();

  // TODO: hardcoded default brand id `cllrwmf4n0014ua9kz1iwr1by`
  // this id is for Apple Brand.
  const [searchModel, setSearchModel] = useState("");
  const modelApi = api.search.models.useQuery({
    brandId:
      selectedBrand === undefined
        ? "cllrwmf4n0014ua9kz1iwr1by"
        : selectedBrand.id,
    search: searchModel,
  });
  const [selectedModel, setSelectedModel] = useState<OptionalItem>();

  const { mutateAsync: createWish } = api.wish.createWish.useMutation();
  const { toast } = useToast();

  if (
    categoryApi.data instanceof Error ||
    brandApi.data instanceof Error ||
    modelApi.data instanceof Error
  ) {
    // TODO: display the error message
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

      const result = await createWish({ modelId: selectedModel.id });
      if (result instanceof Error) {
        return toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
      console.log(result);
      // TODO: close the model
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
    <Dialog>
      <DialogTrigger asChild>
        {/* Plus icon */}
        <AiFillPlusCircle className="text-5xl" />
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
              items={categoryApi.data}
              selected={selectedCategory}
              onSelect={(category) => setSelectedCategory(category)}
              refetch={setSearchCategory}
              loading={categoryApi.isLoading}
            />
          </div>
          <div className="flex justify-between">
            Brand
            <ComboBox
              label="Brand"
              items={brandApi.data}
              selected={selectedBrand}
              onSelect={(brand) => setSelectedBrand(brand)}
              refetch={setSearchBrand}
              loading={brandApi.isLoading}
            />
          </div>
          <div className="flex justify-between">
            Model
            <ComboBox
              label="Model"
              items={modelApi.data}
              selected={selectedModel}
              onSelect={(model) => setSelectedModel(model)}
              refetch={setSearchModel}
              loading={modelApi.isLoading}
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
