import { FC, useEffect, useState } from "react";

import useAdminModal from "@/hooks/useAdminModel";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Image } from "@/utils/validation";
import { Category } from "@prisma/client";

import ImagePicker from "../../common/ImagePicker";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import AdminPageModal from "../AdminPageModel";

interface EditModelProps {
  category: Category | undefined;
  setCategory: (value: Category | undefined) => void;
  onEdit: () => void;
}

export const EditModel: FC<EditModelProps> = ({
  category,
  setCategory,
  onEdit: afterEdit,
}) => {
  const updateCategoryApi = api.category.updateCategoryById.useMutation();

  const [categoryName, setCategoryName] = useState(category?.name ?? "");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // image object returned from server after uploading the image
  const [image, setImage] = useState<Image>();

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const { close: closeModel } = useAdminModal();

  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
      setImageFiles([]);
      setImage(undefined);
    }
  }, [category]);

  const uploadImage = async () => {
    if (imageFiles.length === 0) {
      return setError("select a image to create a image");
    }
    const result = await uploader.upload(imageFiles);
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setImage(result[0]);
  };

  const updateCategory = async () => {
    if (category === undefined) {
      return;
    }
    if (categoryName.trim() === "") {
      return setError("Category name cannot be empty");
    }

    const result = await updateCategoryApi.mutateAsync({
      id: category.id,
      name: categoryName,
      image,
    });
    if (result instanceof Error) {
      return setError(result.message);
    }
    setCategory(undefined);
    closeModel();
    afterEdit();
  };

  return (
    <AdminPageModal>
      <section className="flex flex-col gap-4 p-4">
        <h1 className="text-lg font-bold">Edit Category - {category?.name}</h1>
        <Label className="my-4">
          New name
          <Input
            className="my-2"
            value={categoryName}
            onChange={(e) => {
              setCategoryName(e.target.value);
              if (error) {
                setError(undefined);
              }
            }}
          />
        </Label>

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
              onClick={() => void updateCategory()}
              disabled={
                updateCategoryApi.isLoading ||
                categoryName.trim() === "" ||
                (categoryName === category?.name && image === undefined)
              }
            >
              {image !== undefined && categoryName === category?.name
                ? "Update Category image"
                : "Update category"}
            </Button>
          )}
        </div>
        {error && (
          <div className="rounded-lg border border-red-400 p-4 text-center text-red-400">
            {error}
          </div>
        )}
      </section>
    </AdminPageModal>
  );
};
