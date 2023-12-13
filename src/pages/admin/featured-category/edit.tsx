import Container from "@/components/Container";
import ImagePicker from "@/components/common/ImagePicker";
import Loading from "@/components/common/Loading";
import { Button } from "@/components/ui/button";
import { withAdminGuard } from "@/hoc/AdminGuard";
import { prisma } from "@/server/db";
import { api } from "@/utils/api";
import { useImageUploader } from "@/utils/imageUpload";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

interface Category {
  featuredCategory: {
    image: {
      id: string;
      publicId: string;
      url: string;
      fileType: string;
      width: number;
      height: number;
    };
  };
  id: string;
  name: string;
}

export const getServerSideProps = withAdminGuard(async (context) => {
  const id = context.query.id as string | undefined;
  if (!id) {
    return {
      notFound: true,
    };
  }
  const category = await prisma.category.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      featuredCategory: {
        select: {
          image: {
            select: {
              id: true,
              publicId: true,
              url: true,
              fileType: true,
              width: true,
              height: true,
            },
          },
        },
      },
    },
  });
  if (!category) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      category,
    },
  };
});

export default function EditFeaturedCategoryPage({
  category,
}: {
  category: Category;
}) {
  const router = useRouter();
  // file object to store the file to upload
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // image object returned from server after uploading the image

  const uploader = useImageUploader();

  const [error, setError] = useState<string>();

  const uploadImage = async () => {
    if (imageFiles.length === 0) {
      return new Error("You must upload an image");
    }
    const result = await uploader.upload(imageFiles);
    return result;
  };

  const updateFeaturedCategoryApi =
    api.category.updateFeaturedCategoryById.useMutation();

  const updateFeaturedCategory = async () => {
    try {
      const images = await uploadImage();
      if (images instanceof Error) {
        return setError(images.message);
      }
      if (images.length === 0) {
        return setError("You must upload an image");
      }
      await updateFeaturedCategoryApi.mutateAsync({
        categoryId: category.id,
        image: images[0]!,
      });
      void router.push("/admin/featured-category");
    } catch (error) {
      console.error(error);
      return setError("Something went wrong");
    }
  };

  return (
    <Container className="flex justify-center">
      <section className="flex h-full w-full flex-col gap-4 p-4 md:h-fit md:w-4/6 lg:h-fit lg:w-3/6 xl:w-2/5">
        <div className="flex items-center justify-center rounded-lg border p-2">
          <Link href={category.featuredCategory.image.url} download>
            <Image
              src={category.featuredCategory.image.url}
              width={category.featuredCategory.image.width}
              height={category.featuredCategory.image.height}
              alt="previous Image"
              className="cursor-pointer"
              title="Click to download image"
            />
          </Link>
        </div>
        <div className="flex items-end justify-between gap-8">
          <ImagePicker
            setImages={setImageFiles}
            maxImages={1}
            images={imageFiles}
            className="text-center text-xs"
          >
            Click here to upload new Image
          </ImagePicker>
          <Button
            onClick={() => void updateFeaturedCategory()}
            disabled={
              uploader.isLoading ||
              imageFiles.length === 0 ||
              updateFeaturedCategoryApi.isLoading
            }
          >
            Upload Image
          </Button>
        </div>
        {uploader.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Uploading image...
            <Loading />
          </div>
        )}
        {updateFeaturedCategoryApi.isLoading && (
          <div className="flex flex-col items-center justify-center rounded-lg border p-2">
            Uploading category...
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
