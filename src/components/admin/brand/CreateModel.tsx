import { FC, useState } from "react";

import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Image } from "@/utils/validation";

import ImagePicker from "../../common/ImagePicker";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import AdminPageModal from "../PopupModel";

export interface CreateModelProps {
  createModelVisibility: boolean;
  setCreateModelVisibility: (value: boolean) => void;
  onCreate: () => void;
}

export const CreateModel: FC<CreateModelProps> = ({
  createModelVisibility,
  setCreateModelVisibility,
  onCreate,
}) => {
  const createBrandApi = api.brand.createBrand.useMutation();

  const [brandName, setBrandName] = useState("");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // image object returned from server after uploading the image
  const [image, setImage] = useState<Image>();

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const uploadImage = async () => {
    const result = await uploader.upload(imageFiles);
    console.log(result);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setImage(result[0]);
  };

  const createBrand = async () => {
    const result = await createBrandApi.mutateAsync({
      name: brandName,
      image,
    });
    if (result instanceof Error) {
      return setError(result.message);
    }
    setCreateModelVisibility(false);
    onCreate();
  };

  return (
    <AdminPageModal
      visibility={createModelVisibility}
      setVisibility={setCreateModelVisibility}
    >
      <section className="flex flex-col gap-4 p-4">
        <Label className="my-4">
          Brand Name
          <Input
            className="my-2"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
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
              onClick={() => void createBrand()}
              disabled={brandName.trim() === "" || createBrandApi.isLoading}
            >
              Create Brand
            </Button>
          )}
        </div>
      </section>

      <div>{error}</div>
    </AdminPageModal>
  );
};
