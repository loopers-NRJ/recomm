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

const EditCategoryPage = () => {
  const router = useRouter();
  const categoryId = router.query.id as string | undefined;

  const categoryApi = api.category.getCategoryById.useQuery({ categoryId });

  const updateCategoryApi = api.category.updateCategoryById.useMutation();

  const [categoryName, setCategoryName] = useState("");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // image object returned from server after uploading the image
  const [image, setImage] = useState<Image>();

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const uploadImage = async () => {
    if (imageFiles.length === 0) {
      return setError("select a image to create a image");
    }
    const result = await uploader.upload(imageFiles);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setImage(result[0]);
  };

  const updateCategory = async () => {
    if (
      categoryApi.data === undefined ||
      categoryApi.data === null ||
      categoryApi.isError
    ) {
      return;
    }
    if (categoryName.trim() === "") {
      return setError("Category name cannot be empty");
    }
    try {
      await updateCategoryApi.mutateAsync({
        id: categoryApi.data.id,
        name: categoryName,
        image,
      });
      void router.push("/admin/category");
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }
    }
  };

  if (categoryApi.isLoading) {
    return <h1>Loading</h1>;
  }
  if (categoryApi.isError || categoryApi.data === null) {
    return <h1>Something went wrong</h1>;
  }

  return (
    <Container className="flex justify-center">
      <section className="flex flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <h1 className="text-lg font-bold">
          Edit Category - {categoryApi.data.name}
        </h1>
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
                (categoryName === categoryApi.data?.name && image === undefined)
              }
            >
              {image !== undefined && categoryName === categoryApi.data.name
                ? "Update Category image"
                : "Update category"}
            </Button>
          )}
        </div>
        {uploader.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Uploading image...
            <Loader2 className="animate-spin" />
          </div>
        )}
        {updateCategoryApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Updating Category {categoryName} ...
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

export default EditCategoryPage;
