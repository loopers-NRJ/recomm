import { Loader2 } from "lucide-react";
import { FC, useState } from "react";

import useAdminModal from "@/hooks/useAdminModel";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Brand } from "@prisma/client";

import ImagePicker from "../../common/ImagePicker";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import AdminPageModal from "../AdminPageModel";

interface EditModelProps {
  brand: Brand;
  setBrand: (value: Brand | undefined) => void;
  onEdit: () => void;
}

export const EditModel: FC<EditModelProps> = ({
  brand,
  setBrand,
  onEdit: afterEdit,
}) => {
  const updateBrandApi = api.brand.updateBrandById.useMutation();

  const [brandName, setBrandName] = useState(brand.name);
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();
  const { close: closeModel } = useAdminModal();

  const updateBrand = async () => {
    let image;
    if (imageFiles.length > 0) {
      const result = await uploader.upload(imageFiles);
      if (result instanceof Error) {
        return setError(result.message);
      }
      image = result[0];
    }
    const result = await updateBrandApi.mutateAsync({
      id: brand.id,
      name: brandName,
      image,
    });
    if (result instanceof Error) {
      return setError(result.message);
    }
    setBrand(undefined);
    closeModel();
    afterEdit();
  };

  return (
    <AdminPageModal>
      <section className="flex flex-col gap-4 p-4">
        <h1 className="text-lg font-bold">Edit Brand - {brand.name}</h1>
        <Label className="my-4">
          New name
          <Input
            className="my-2"
            value={brandName}
            onChange={(e) => {
              setBrandName(e.target.value);
              if (error) setError(undefined);
            }}
          />
        </Label>

        <div className="flex items-end justify-between gap-8">
          <ImagePicker
            setImages={setImageFiles}
            maxImages={1}
            images={imageFiles}
          />
          <Button
            onClick={() => void updateBrand()}
            disabled={
              uploader.isLoading ||
              updateBrandApi.isLoading ||
              brandName.trim() === "" ||
              brandName === brand.name
            }
          >
            {imageFiles.length > 0 ? "Upload Image" : "Update Brand"}
          </Button>
        </div>
        {uploader.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Uploading image...
            <Loader2 className="animate-spin" />
          </div>
        )}
        {updateBrandApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Updating Brand {brandName} ...
            <Loader2 className="animate-spin" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-500 p-2 text-red-500">
            {error}
          </div>
        )}
      </section>
    </AdminPageModal>
  );
};
