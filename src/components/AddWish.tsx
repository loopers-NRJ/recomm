"use client";

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
import { FC, useState } from "react";
import { AiFillPlusCircle } from "react-icons/ai";
import ComboBox from "./common/ComboBox";
import { api } from "@/utils/api";
import { useToast } from "./ui/use-toast";

const AddWish: FC = () => {
  const { data: categories = [] } = api.category.getCategories.useQuery({});
  const [selectedCategory, setSelectedCategory] = useState("");

  // TODO: hardcoded default category id `cllrwmem20005ua9k3cxywefx`
  // this id is for Electronics Category.
  const { data: brands = [] } = api.category.getBrandsByCategoryId.useQuery({
    categoryId:
      selectedCategory === "" ? "cllrwmem20005ua9k3cxywefx" : selectedCategory,
  });
  const [selectedBrand, setSelectedBrand] = useState("");

  // TODO: hardcoded default brand id `cllrwmf4n0014ua9kz1iwr1by`
  // this id is for Apple Brand.
  const { data: models = [] } = api.brand.getModelsByBrandId.useQuery({
    brandId: selectedBrand === "" ? "cllrwmf4n0014ua9kz1iwr1by" : selectedBrand,
  });
  const [selectedModel, setSelectedModel] = useState("");
  const { mutateAsync: createWish } = api.wish.createWish.useMutation();
  const { toast } = useToast();
  if (
    categories instanceof Error ||
    brands instanceof Error ||
    models instanceof Error
  ) {
    // TODO: display the error message
    const error =
      categories instanceof Error
        ? categories
        : brands instanceof Error
        ? brands
        : models instanceof Error
        ? models
        : null;
    return <h1>{error?.message}</h1>;
  }

  const handleClick = async () => {
    try {
      const result = await createWish({ modelId: selectedModel });
      if (result instanceof Error) {
        alert(result.message);
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
        <AiFillPlusCircle className="fixed bottom-5 right-5 text-5xl" />
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
              items={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          <div className="flex justify-between">
            Brand
            <ComboBox
              label="Brand"
              items={brands}
              selected={selectedBrand}
              onSelect={setSelectedBrand}
            />
          </div>
          <div className="flex justify-between">
            Model
            <ComboBox
              label="Model"
              items={models}
              selected={selectedModel}
              onSelect={setSelectedModel}
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
