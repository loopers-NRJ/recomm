import Container from "@/components/Container";
import { withAdminGuard } from "@/components/hoc/AdminGuard";
import ImagePicker from "@/components/common/ImagePicker";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Image } from "@/utils/validation";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import CategoryComboBox from "@/components/common/CategoryComboBox";
import { OptionalItem } from "@/types/custom";

export const getServerSideProps = withAdminGuard();

const CreateFeaturedCategoryPage = () => {
  const router = useRouter();
  const urlId = router.query.id as string | undefined;

  const createFeaturedCategoryApi =
    api.category.makeCategoryFeaturedById.useMutation();
  const [selectedCategory, setSelectedCategory] = useState<OptionalItem>(
    urlId
      ? {
          id: urlId,
          name: "",
        }
      : undefined
  );
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // image object returned from server after uploading the image
  const [image, setImage] = useState<Image>();

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const uploadImage = async () => {
    const result = await uploader.upload(imageFiles);
    if (result instanceof Error) {
      return setError(result.message);
    }
    setImage(result[0]);
  };

  const createFeaturedCategory = async () => {
    try {
      if (image === undefined) {
        return setError("You must upload an image");
      }
      if (selectedCategory === undefined) {
        return setError("You must select a category");
      }
      await createFeaturedCategoryApi.mutateAsync({
        categoryId: selectedCategory.id,
        image,
      });
      void router.push("/admin/categorys");
    } catch (error) {
      if (error instanceof Error) {
        return setError(error.message);
      }
    }
  };

  return (
    <Container className="flex justify-center">
      <section className="flex h-full w-full flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <CategoryComboBox
          selected={selectedCategory}
          onSelect={(selected) => setSelectedCategory(selected)}
        />

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
              onClick={() => void createFeaturedCategory()}
              disabled={
                selectedCategory === undefined ||
                image === undefined ||
                createFeaturedCategoryApi.isLoading
              }
            >
              Make it as Featured Category
            </Button>
          )}
        </div>
        {uploader.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Uploading image...
            <Loader2 className="animate-spin" />
          </div>
        )}
        {createFeaturedCategoryApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Making {selectedCategory?.name} as Featured Category ...
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

export default CreateFeaturedCategoryPage;
