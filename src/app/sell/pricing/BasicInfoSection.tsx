import BrandComboBox from "../../../components/combobox/BrandComboBox";
import ModelComboBox from "../../../components/combobox/ModelComboBox";
import { useEffect } from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../../../components/ui/input";
import Textarea from "../../../components/common/Textarea";
import { usePostingState } from "@/app/sell/PostingState";

export default function BasicInfoSection() {
  const {
    title,
    setTitle,
    description,
    setDescription,
    selectedBrand,
    setSelectedBrand,
    selectedModel,
    setSelectedModel,
    selectedCategory,
    formError,
  } = usePostingState();

  useEffect(() => {
    setSelectedModel(undefined);
  }, [selectedBrand, setSelectedModel]);

  if (!selectedCategory) return null;

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
            error={formError.brandId?.message}
          />
          <ModelComboBox
            selected={selectedModel}
            onSelect={setSelectedModel}
            categoryId={selectedCategory.id}
            brandId={selectedBrand?.id}
            disabled={!selectedBrand}
            error={formError.modelId?.message}
          />
        </div>
      </section>
      <hr className="my-6" />
    </>
  );
}
