import { FC, useState } from "react";
import { v4 as uuid } from "uuid";

import ComboBox from "@/components/common/ComboBox";
import { Variant } from "@/types/admin";
import { FetchItems, Item } from "@/types/item";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Image } from "@/utils/validation";

import ImagePicker from "../../common/ImagePicker";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import AdminPageModal from "../PopupModel";
import VariantPicker from "./VariantPicker";

export interface CreateModelProps {
  onCreate: () => void;
}

export const CreateModel: FC<CreateModelProps> = () => {
  const createModelApi = api.model.createModel.useMutation();

  const [modelName, setModelName] = useState("");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // image object returned from server after uploading the image
  const [image, setImage] = useState<Image>();

  // category
  const [brand, setBrand] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<Item>();

  // brand
  const [category, setCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Item>();

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const [variants, setVarients] = useState<Variant[]>([]);

  const uploadImage = async () => {
    const result = await uploader.upload(imageFiles);
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setImage(result[0]);
  };

  const createModel = async () => {
    // const result = await createModelApi.mutateAsync({
    //   name: modelName,
    //   image,
    // });
    // if (result instanceof Error) {
    //   return setError(result.message);
    // }
    // setCreateModelVisibility(false);
    // onCreate();
  };

  return (
    <AdminPageModal>
      <section className="flex flex-col gap-4 p-4">
        <Label className="my-4">
          Model Name
          <Input
            className="my-2"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
          />
        </Label>

        <Label className="flex items-center justify-between">
          Brand
          <ComboBox
            label="Brand"
            fetchItems={api.search.brands.useQuery as FetchItems}
            value={brand}
            onChange={setBrand}
            selected={selectedBrand}
            onSelect={setSelectedBrand}
          />
        </Label>

        <Label className="flex items-center justify-between">
          Category
          <ComboBox
            label="Category"
            fetchItems={api.search.category.useQuery as FetchItems}
            value={category}
            onChange={setCategory}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </Label>

        <VariantPicker variants={variants} setVariants={setVarients} />

        <Button
          variant="ghost"
          onClick={() =>
            setVarients([
              ...variants,
              { id: uuid(), option: "", values: [], search: "" },
            ])
          }
        >
          Add new Variant
        </Button>
        <div className="flex items-end justify-between gap-8">
          <ImagePicker
            setImages={setImageFiles}
            maxImages={1}
            images={imageFiles}
          />
          {imageFiles.length > 0 && image === undefined ? (
            <Button
              onClick={() => void uploadImage()}
              disabled={uploader.isLoading}
            >
              Upload Image
            </Button>
          ) : (
            <Button
              onClick={() => void createModel()}
              disabled={modelName.trim() === "" || createModelApi.isLoading}
            >
              Create Model
            </Button>
          )}
        </div>
      </section>

      <div>{error}</div>
    </AdminPageModal>
  );
};
