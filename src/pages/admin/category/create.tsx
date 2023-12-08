import Container from "@/components/Container";
import { withAdminGuard } from "@/components/hoc/AdminGuard";
import ImagePicker from "@/components/common/ImagePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";

export const getServerSideProps = withAdminGuard();

const CreateCategoryPage = () => {
  const createCategoryApi = api.category.createCategory.useMutation();
  const [categoryName, setCategoryName] = useState("");
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const router = useRouter();
  const parentName = router.query.parentName as string | undefined;
  const parentId = router.query.parentId as string | undefined;

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
    createCategoryApi.mutate({
      name: categoryName,
      image: image?.[0],
      parentCategoryId: parentId ?? undefined,
    });
  };

  if (
    createCategoryApi.isSuccess &&
    createCategoryApi.data !== undefined &&
    !createCategoryApi.isError
  ) {
    void router.push("/admin/category");
  }

  return (
    <Container className="flex justify-center">
      <section className="flex h-full w-full flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
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
        {createCategoryApi.isError && (
          <div className="rounded-lg border border-red-500 p-2">
            {createCategoryApi.error.message}
          </div>
        )}
        {createCategoryApi.isError && (
          <div className="rounded-lg border border-red-500 p-2">
            Something went wrong
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-500 p-2">{error}</div>
        )}
      </section>
    </Container>
  );
};

export default CreateCategoryPage;
