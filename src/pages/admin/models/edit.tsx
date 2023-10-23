import Container from "@/components/Container";
import ImagePicker from "@/components/common/ImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const EditModelPage = () => {
  const router = useRouter();
  const modelId = router.query.id as string | undefined;
  const updateModelApi = api.model.updateModelById.useMutation();

  const modelApi = api.model.getModelById.useQuery({ modelId });

  const [modelName, setModelName] = useState(modelApi.data?.name ?? "");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (modelApi.data != null && !modelApi.isError) {
      setModelName(modelApi.data.name);
    }
  }, [modelApi]);

  const updateModel = async () => {
    if (modelApi.data == null || modelApi.isError) {
      return;
    }
    let image;
    if (imageFiles.length > 0) {
      const result = await uploader.upload(imageFiles);
      if (result instanceof Error) {
        return setError(result.message);
      }
      image = result[0];
    }

    try {
      await updateModelApi.mutateAsync({
        id: modelApi.data.id,
        name: modelName,
        image,
      });
      void router.push("/admin/models");
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }
    }
  };

  if (modelApi.isLoading) {
    return <h1>Loading</h1>;
  }

  if (modelApi.isError || modelApi.data === null) {
    return <h1>Something went wrong</h1>;
  }

  const { data: model } = modelApi;

  return (
    <Container className="flex justify-center">
      <section className="flex flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
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
    </Container>
  );
};

export default EditModelPage;
