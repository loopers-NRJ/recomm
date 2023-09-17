import { Loader2 } from "lucide-react";
import { FC, useState } from "react";

import useAdminModal from "@/hooks/useAdminModel";
import { Model } from "@/types/prisma";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";

import ImagePicker from "../../common/ImagePicker";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import AdminPageModal from "../AdminPageModel";

interface EditModelProps {
  model: Model;
  setModel: (value: Model | undefined) => void;
  onEdit: () => void;
}

export const EditModel: FC<EditModelProps> = ({
  model,
  setModel,
  onEdit: afterEdit,
}) => {
  const updateModelApi = api.model.updateModelById.useMutation();

  const [modelName, setModelName] = useState(model.name);
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();
  const { close: closeModel } = useAdminModal();

  const updateModel = async () => {
    let image;
    if (imageFiles.length > 0) {
      const result = await uploader.upload(imageFiles);
      if (result instanceof Error) {
        return setError(result.message);
      }
      image = result[0];
    }

    const result = await updateModelApi.mutateAsync({
      id: model.id,
      name: modelName,
      image,
    });
    if (result instanceof Error) {
      return setError(result.message);
    }
    setModel(undefined);
    closeModel();
    afterEdit();
  };

  return (
    <AdminPageModal>
      <section className="flex flex-col gap-4 p-4">
        <h1 className="text-lg font-bold">Edit Model - {model.name}</h1>
        <Label className="my-4">
          New name
          <Input
            className="my-2"
            value={modelName}
            onChange={(e) => {
              setModelName(e.target.value);
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
            onClick={() => void updateModel()}
            disabled={
              uploader.isLoading ||
              updateModelApi.isLoading ||
              ((modelName.trim() === "" || modelName === model.name) &&
                imageFiles.length === 0)
            }
          >
            {imageFiles.length > 0 ? "Update Model Image" : "Update Model"}
          </Button>
        </div>
        {uploader.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Uploading image...
            <Loader2 className="animate-spin" />
          </div>
        )}
        {updateModelApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Updating Model {modelName} ...
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
