import BrandComboBox from "../common/BrandComboBox";
import ModelComboBox from "../common/ModelComboBox";
import { useEffect } from "react";
import { OptionalItem } from "@/types/custom";
import { Category } from "@prisma/client";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import Textarea from "../ui/textarea";
import { ProductFormError } from "@/utils/validation";

interface BasicInfoSectionProps {
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  selectedCategory: Category;
  selectedBrand: OptionalItem;
  setSelectedBrand: (value: OptionalItem) => void;
  selectedModel: OptionalItem;
  setSelectedModel: (value: OptionalItem) => void;
  formError: ProductFormError;
}

export default function BasicInfoSection({
  title,
  setTitle,
  description,
  setDescription,
  selectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedModel,
  setSelectedModel,
  formError,
}: BasicInfoSectionProps) {
  useEffect(() => {
    setSelectedModel(undefined);
  }, [selectedBrand, setSelectedModel]);

  return (
    <>
      <section>
        {/* Basic Questions */}
        <h2 className="my-4 text-xl font-bold">Basic Informations</h2>
        <div className="flex flex-col gap-6">
          <Label className="flex cursor-pointer flex-col gap-2">
            <span className="text-base font-semibold">
              Give a title to your {selectedCategory.name}
            </span>
            <Input
              type="text"
              placeholder="Enter a catchy title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={formError.title ? "border border-red-400" : ""}
            />
            {formError.title && (
              <span className="text-sm text-red-500">
                {formError.title.message}
              </span>
            )}
          </Label>

          <Label className="flex cursor-pointer flex-col gap-2">
            <span className="text-base font-semibold">
              Describe your {selectedCategory.name}
            </span>
            <Textarea
              placeholder={
                "Describe its features, benefits, and why customers will love it."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={formError.description ? "border border-red-400" : ""}
            />
            {formError.description && (
              <span className="text-sm text-red-500">
                {formError.description.message}
              </span>
            )}
          </Label>
          <BrandComboBox
            selected={selectedBrand}
            onSelect={setSelectedBrand}
            categoryId={selectedCategory.id}
            requiredError={!!formError.brandId}
          />
          <ModelComboBox
            selected={selectedModel}
            onSelect={setSelectedModel}
            categoryId={selectedCategory.id}
            brandId={selectedBrand?.id}
            requiredError={!!formError.modelId}
            disabled={!selectedBrand}
          />
        </div>
      </section>
      <hr className="my-6" />
    </>
  );
}
