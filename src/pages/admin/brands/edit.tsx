import Container from "@/components/Container";
import ImagePicker from "@/components/common/ImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

const EditBrandPage = () => {
  const router = useRouter();
  const brandId = router.query.id as string | undefined;

  const updateBrandApi = api.brand.updateBrandById.useMutation();

  const brandApi = api.brand.getBrandById.useQuery({ brandId });

  const [brandName, setBrandName] = useState("");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const updateBrand = async () => {
    if (brandApi.data == null) {
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
      await updateBrandApi.mutateAsync({
        id: brandApi.data.id,
        name: brandName,
        image,
      });
      void router.push("/admin/brands");
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }
    }
  };

  if (brandApi.isLoading) {
    return <h1>Loading</h1>;
  }
  if (brandApi.isError || brandApi.data === null) {
    return <h1>Something went wrong</h1>;
  }
  const { data: brand } = brandApi;
  return (
    <Container className="flex justify-center">
      <section className="flex flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
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
    </Container>
  );
};

export default EditBrandPage;
