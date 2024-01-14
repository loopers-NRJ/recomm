import { cn } from "@/lib/utils";
import { Loader2 as Spinner, Plus } from "lucide-react";
import Image from "next/image";
import React, { type FC, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  maxImageSizeInMB as defaultMaxImageSizeInMB,
  maxImageCount,
} from "@/utils/constants";

interface ImageFile {
  id: string;
  file: File;
  progress: number;
}

export interface ImagePickerProps {
  maxImages?: number;
  maxImageSizeInMB?: number;
  setImages: (images: File[] | ((prev: File[]) => File[])) => void;
  acceptedImageFormats?: string[];
  images: File[];
  requiredError?: boolean;
  children?: React.ReactNode;
  className?: string;
  compress?: boolean;
}

const ImagePicker: FC<ImagePickerProps> = ({
  maxImageSizeInMB = defaultMaxImageSizeInMB,
  maxImages = maxImageCount,
  acceptedImageFormats = [
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
  ],
  setImages: setImagesToParent,
  images: parentImages,
  requiredError,
  children,
  className,
  compress = true,
}) => {
  const [images, setImages] = useState<ImageFile[]>(
    parentImages.map((image) => ({
      id: image.name,
      file: image,
      progress: 100,
    })),
  );

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const imageCompression = (await import("browser-image-compression"))
      .default;
    const toast = (await import("react-hot-toast")).default;

    const newImages = [];
    if (event.target.files !== null) {
      const files = [...event.target.files];
      if (files.length > maxImages) {
        toast.error(`Max image count is ${maxImages}`);
        files.splice(maxImages);
      }
      for (const image of files) {
        // condition to check weather the image is already present
        if (images.some((prevImage) => prevImage.file.name === image.name)) {
          toast.error("Image is already present");
          continue;
        }
        // condition to check if the image size is greater than the max size
        if (image.size > maxImageSizeInMB * 1024 * 1024) {
          toast.error(
            `Image size is too large. Max image size is ${maxImageSizeInMB}MB`,
          );
          continue;
        }
        // condition to check if the image format is supported
        if (!acceptedImageFormats.includes(image.type)) {
          toast.error(
            `${
              image.type.split("/")?.[1] ?? "Image"
            } format is not supported. Supported formats are ${acceptedImageFormats.join(
              ", ",
            )}`,
          );
          continue;
        }
        // condition to check if the max image count is reached
        if (images.length + newImages.length >= maxImages) {
          toast.error(`Max image count is ${maxImages}`);
          break;
        }
        const id = uuid();

        setImages((prev) => [
          ...prev,
          {
            id,
            file: image,
            progress: 0,
          },
        ]);
        if (compress) {
          imageCompression(image, {
            maxSizeMB: 3,
            alwaysKeepResolution: true,
            onProgress(progress) {
              setImages((prev) => {
                const newImages = [...prev];
                const index = newImages.findIndex((image) => image.id === id);
                newImages[index]!.progress = progress;
                return newImages;
              });
            },
          })
            .then((compressedImage) => {
              setImages((prev) => {
                const newImages = [...prev];
                const index = newImages.findIndex((image) => image.id === id);
                newImages[index]!.file = compressedImage;
                return newImages;
              });
              let compressedImageFile: File;

              if (compressedImage instanceof Blob) {
                compressedImageFile = new File([compressedImage], image.name, {
                  type: image.type,
                  lastModified: Date.now(),
                });
              } else {
                compressedImageFile = compressedImage;
              }

              setImagesToParent((prev) => [...prev, compressedImageFile]);
            })
            .catch((error) => {
              console.error(error);
              toast.error("Failed to compress image");
            });
        } else {
          setImages((prev) => {
            const newImages = [...prev];
            const index = newImages.findIndex((image) => image.id === id);
            newImages[index]!.progress = 100;
            return newImages;
          });
          setImagesToParent((prev) => [...prev, image]);
        }
      }
    }
    event.target.value = "";
  };

  return (
    <div>
      <div className="flex gap-2 overflow-auto">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border hover:opacity-80"
          >
            {image.progress !== 100 && (
              <div className="absolute flex h-full w-full items-center justify-center bg-black opacity-40">
                <Spinner
                  className="h-16 w-16 animate-spin text-white"
                  size={30}
                />
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-white">{image.progress}%</span>
                </div>
              </div>
            )}
            <Image
              src={URL.createObjectURL(image.file)}
              alt="image"
              width={150}
              height={150}
              className="h-24 w-24 object-cover "
              onClick={() => {
                setImages((prev) => {
                  const newImages = [...prev];
                  newImages.splice(index, 1);
                  return newImages;
                });
                setImagesToParent((prev) => {
                  const newImages = [...prev];
                  newImages.splice(index, 1);
                  return newImages;
                });
              }}
            />
          </div>
        ))}

        {maxImages - images.length > 0 && (
          <label
            className={cn(
              "flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-xl border object-cover",
              requiredError ? "border-red-500" : "",
              className,
            )}
            htmlFor="image-picker"
          >
            {children ?? <Plus />}
          </label>
        )}
        <input
          type="file"
          name="image-picker"
          id="image-picker"
          multiple
          className="hidden"
          accept="image/*"
          onChange={(event) => void handleImageSelect(event)}
        />
      </div>
    </div>
  );
};

export default React.memo(ImagePicker);
