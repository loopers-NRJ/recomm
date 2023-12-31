"use client";

import Container from "@/components/Container";
import CategoryComboBox from "@/components/common/CategoryComboBox";
import ImagePicker from "@/components/common/ImagePicker";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import type { OptionalItem } from "@/types/custom";
import { api } from "@/trpc/react";
import { useImageUploader } from "@/utils/imageUpload";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CreateFeaturedCategory() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");

  const createFeaturedCategoryApi =
    api.category.makeCategoryFeaturedById.useMutation();
  const [selectedCategory, setSelectedCategory] = useState<OptionalItem>(
    urlId
      ? {
          id: urlId,
          name: "",
        }
      : undefined,
  );
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const uploader = useImageUploader();
  const [error, setError] = useState<string>();

  const createFeaturedCategory = async () => {
    try {
      if (selectedCategory === undefined) {
        return setError("You must select a category");
      }
      if (imageFiles.length == 0) {
        return setError("Upload an Image");
      }
      const images = await uploader.upload(imageFiles);
      if (images instanceof Error) {
        return setError(images.message);
      }
      const image = images[0];
      if (!image) {
        return setError("Upload an Image");
      }

      await createFeaturedCategoryApi.mutateAsync({
        categoryId: selectedCategory.id,
        image,
      });
      router.push("/admin/tables/categorys");
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
          <Button
            onClick={() => void createFeaturedCategory()}
            disabled={
              selectedCategory === undefined ||
              createFeaturedCategoryApi.isLoading ||
              uploader.isLoading ||
              imageFiles.length === 0
            }
          >
            Make it as Featured Category
          </Button>
        </div>
        {uploader.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Uploading image...
            <Loading />
          </div>
        )}
        {createFeaturedCategoryApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Making {selectedCategory?.name} as Featured Category ...
            <Loading />
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
}
