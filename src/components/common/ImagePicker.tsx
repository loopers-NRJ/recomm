import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Image from "next/image";
import React, { type FC, useRef } from "react";
import {
  MAXIMUM_IMAGE_SIZE_IN_MB as defaultMaxImageSizeInMB,
  MAXIMUM_IMAGE_COUNT,
} from "@/utils/constants";
import { Label } from "../ui/label";
import toast from "react-hot-toast";

export interface ImagePickerProps {
  maxImages?: number;
  maxImageSizeInMB?: number;
  setImages: (images: File[]) => void;
  acceptedImageFormats?: string[];
  images: File[];
  requiredError?: boolean;
  children?: React.ReactNode;
  className?: string;
  compress?: boolean;
}

const ImagePicker: FC<ImagePickerProps> = ({
  maxImageSizeInMB = defaultMaxImageSizeInMB,
  maxImages = MAXIMUM_IMAGE_COUNT,
  acceptedImageFormats = [
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/svg+xml",
  ],
  setImages,
  images,
  requiredError,
  children,
  className,
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newImages = [];
    if (event.target.files === null) return;
    const files = [...event.target.files];
    if (files.length > maxImages) {
      toast.error(`Max image count is ${maxImages}`);
      files.splice(maxImages);
    }
    for (const image of files) {
      // condition to check weather the image is already present
      if (images.some((prevImage) => prevImage.name === image.name)) {
        toast.error("Image is already present");
        return;
      }
      // condition to check if the image size is greater than the max size
      if (image.size > maxImageSizeInMB * 1024 * 1024) {
        toast.error(
          `Image size is too large. Max image size is ${maxImageSizeInMB}MB`,
        );
        return;
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
        return;
      }
      // condition to check if the max image count is reached
      if (images.length + newImages.length >= maxImages) {
        toast.error(`Max image count is ${maxImages}`);
        return;
      }
    }
    setImages([...images, ...files]);
    event.target.value = "";
  };

  return (
    <div>
      <div className="flex gap-2 overflow-auto">
        {images.map((image, index) => (
          <div
            key={image.name}
            className="relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border hover:opacity-80"
          >
            <Image
              src={URL.createObjectURL(image)}
              alt="image"
              width={150}
              height={150}
              className="h-24 w-24 object-cover"
              onClick={() => {
                const newImages = [...images];
                newImages.splice(index, 1);
                setImages(newImages);
              }}
            />
          </div>
        ))}

        {maxImages - images.length > 0 && (
          <Label
            className={cn(
              "flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-xl border object-cover",
              requiredError ? "border-red-500" : "",
              className,
            )}
            htmlFor="image-picker"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                ref.current?.click();
              }
            }}
          >
            {children ?? <Plus />}
          </Label>
        )}
        <input
          type="file"
          name="image-picker"
          id="image-picker"
          multiple
          className="hidden"
          accept="image/*"
          ref={ref}
          onChange={(event) => void handleImageSelect(event)}
        />
      </div>
    </div>
  );
};

export default React.memo(ImagePicker);
