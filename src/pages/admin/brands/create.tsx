import Container from "@/components/Container";
import { withAdminGuard } from "@/components/hoc/AdminGuard";
import ImagePicker from "@/components/common/ImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Image } from "@/utils/validation";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export const getServerSideProps = withAdminGuard();

const CreateBrandPage = () => {
  const createBrandApi = api.brand.createBrand.useMutation();
  const [brandName, setBrandName] = useState("");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // image object returned from server after uploading the image
  const [image, setImage] = useState<Image>();

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();
  const router = useRouter();

  const uploadImage = async () => {
    const result = await uploader.upload(imageFiles);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setImage(result[0]);
  };

  const createBrand = async () => {
    try {
      await createBrandApi.mutateAsync({
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

  return (
    <Container className="flex justify-center">
      <section className="flex h-full w-full flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
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
              {imageFiles.length > 0
                ? "Create Brand"
                : "Create Brand without image"}
            </Button>
          )}
        </div>
      </section>

      {uploader.isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border p-2">
          Uploading image...
          <Loader2 className="animate-spin" />
        </div>
      )}
      {createBrandApi.isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border p-2">
          Creating Brand {brandName} ...
          <Loader2 className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500 p-2 text-red-500">
          {error}
        </div>
      )}
    </Container>
  );
};

export default CreateBrandPage;
