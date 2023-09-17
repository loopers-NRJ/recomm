import { Loader2 } from "lucide-react";
import { FC, useState } from "react";

import useAdminModal from "@/hooks/useAdminModel";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";

import ImagePicker from "../../common/ImagePicker";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import AdminPageModal from "../AdminPageModel";

export interface CreateModelProps {
  onCreate: () => void;
  parentName?: string;
  parentId: string | null;
}

export const CreateModel: FC<CreateModelProps> = ({
  onCreate,
  parentId,
  parentName,
}) => {
  const createCategoryApi = api.category.createCategory.useMutation();
  const { close: closeModel } = useAdminModal();
  const [categoryName, setCategoryName] = useState("");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const createCategory = async () => {
    let image;
    if (imageFiles.length > 0) {
      image = await uploader.upload(imageFiles);
      if (image instanceof Error) {
        return setError(image.message);
      }
      if (image.length < 1) {
        return setError("Invalid image");
      }
    }
    const result = await createCategoryApi.mutateAsync({
      name: categoryName,
      image: image?.[0],
      parentCategoryId: parentId ?? undefined,
    });
    if (result instanceof Error) {
      return setError(result.message);
    }
    closeModel();
    onCreate();
  };

  return (
    <AdminPageModal>
      <section className="flex flex-col gap-4 p-4">
        <Label className="my-4">
          Category Name
          <Input
            className="my-2"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </Label>

        <Label className="flex items-center justify-between">
          <div>Parent Category</div>
          <div>{parentName ?? "None"}</div>
        </Label>

        <div className="flex items-end justify-between gap-8">
          <ImagePicker
            setImages={setImageFiles}
            maxImages={1}
            images={imageFiles}
          />
          <Button
            // onClick={() => void uploadImage()}
            onClick={() => void createCategory()}
            disabled={
              categoryName.trim() === "" ||
              createCategoryApi.isLoading ||
              uploader.isLoading
            }
          >
            {imageFiles.length > 0
              ? "Create Category"
              : "Create Category without image"}
          </Button>
        </div>
      </section>

      {uploader.isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border p-2">
          Uploading image...
          <Loader2 className="animate-spin" />
        </div>
      )}
      {createCategoryApi.isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border p-2">
          Creating Category {categoryName} ...
          <Loader2 className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500 p-2 text-red-500">
          {error}
        </div>
      )}
    </AdminPageModal>
  );
};
