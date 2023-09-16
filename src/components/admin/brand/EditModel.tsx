import { FC, useEffect, useState } from "react";

import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Image } from "@/utils/validation";
import { Brand } from "@prisma/client";

import ImagePicker from "../../common/ImagePicker";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import AdminPageModal from "../PopupModel";

interface EditModelProps {
  brand: Brand | undefined;
  setBrand: (value: Brand | undefined) => void;
  onEdit: () => void;
}

export const EditModel: FC<EditModelProps> = ({
  brand,
  setBrand,
  onEdit: afterEdit,
}) => {
  const updateBrandApi = api.brand.updateBrandById.useMutation();

  const [brandName, setBrandName] = useState(brand?.name ?? "");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // image object returned from server after uploading the image
  const [image, setImage] = useState<Image>();

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (brand) {
      setBrandName(brand.name);
      setImageFiles([]);
      setImage(undefined);
    }
  }, [brand]);

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

  const updateBrand = async () => {
    if (brand === undefined) {
      return;
    }
    if (brandName.trim() === "") {
      return setError("Brand name cannot be empty");
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
    afterEdit();
  };

  return (
    <AdminPageModal
      visibility={brand !== undefined}
      setVisibility={() => setBrand(undefined)}
    >
      <section className="flex flex-col gap-4 p-4">
        <h1 className="text-lg font-bold">Edit Brand - {brand?.name}</h1>
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
          {imageFiles.length > 0 && image === undefined ? (
            <Button
              onClick={() => void uploadImage()}
              disabled={uploader.isLoading}
            >
              Upload Image
            </Button>
          ) : (
            <Button
              onClick={() => void updateBrand()}
              disabled={
                updateBrandApi.isLoading ||
                brandName.trim() === "" ||
                brandName === brand?.name
              }
            >
              Update Brand
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
