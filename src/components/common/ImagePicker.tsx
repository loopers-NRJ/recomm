import { Loader2 as Spinner, Plus } from "lucide-react";
import Image from "next/image";
import { FC, useState } from "react";
import { v4 as uuid } from "uuid";

interface ImageFile {
  id: string;
  file: File;
  progress: number;
}

interface ImagePickerProps {
  maxImages?: number;
  maxImageSizeInMB?: number;
  setImages: (images: File[] | ((prev: File[]) => File[])) => void;
  acceptedImageFormats?: string[];
  images: File[];
  requiredError?: boolean;
}

const ImagePicker: FC<ImagePickerProps> = ({
  maxImageSizeInMB = 15,
  maxImages = 5,
  acceptedImageFormats = ["image/jpeg", "image/jpg", "image/webp"],
  setImages: setImagesToParent,
  images: parentImages,
  requiredError,
}) => {
  const [images, setImages] = useState<ImageFile[]>(
    parentImages.map((image) => ({
      id: image.name,
      file: image,
      progress: 100,
    }))
  );

  const handleImageSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const imageCompression = (await import("browser-image-compression"))
      .default;
    const { toast } = await import("../ui/use-toast");

    const newImages = [];
    if (event.target.files !== null) {
      const files = [...event.target.files];
      if (files.length > maxImages) {
        toast({
          title: "Error",
          description: `Max image count is ${maxImages}`,
          variant: "destructive",
        });
        files.splice(maxImages);
      }
      for (const image of files) {
        // condition to check weather the image is already present
        if (images.some((prevImage) => prevImage.file.name === image.name)) {
          toast({
            title: "Error",
            description: "Image is already present",
            variant: "destructive",
          });
          continue;
        }
        // condition to check if the image size is greater than the max size
        if (image.size > maxImageSizeInMB * 1024 * 1024) {
          toast({
            title: "Error",
            description: `Image size is too large. Max image size is ${maxImageSizeInMB}MB`,
            variant: "destructive",
          });
          continue;
        }
        // condition to check if the image format is supported
        if (!acceptedImageFormats.includes(image.type)) {
          toast({
            title: "Error",
            description: `${
              image.type.split("/")?.[1] ?? "Image"
            } format is not supported. Supported formats are ${acceptedImageFormats.join(
              ", "
            )}`,
            variant: "destructive",
          });
          continue;
        }
        // condition to check if the max image count is reached
        if (images.length + newImages.length >= maxImages) {
          toast({
            title: "Error",
            description: `Max image count is ${maxImages}`,
            variant: "destructive",
          });
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
        imageCompression(image, {
          maxSizeMB: 1,
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
          .catch(() => {
            toast({
              title: "Error",
              description: "Failed to compress image",
              variant: "destructive",
            });
          });
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
            className={`flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-xl border object-cover ${
              requiredError
                ? "border-red-500 text-red-500"
                : "border-gray-300 text-gray-500"
            }`}
            htmlFor="image-picker"
          >
            <Plus />
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

export default ImagePicker;
