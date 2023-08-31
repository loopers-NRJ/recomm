import { Plus } from "lucide-react";
import Image from "next/image";
import { FC } from "react";

interface ImagePickerProps {
  images: File[];
  setImages: (images: File[] | ((prev: File[]) => File[])) => void;
}

const ImagePicker: FC<ImagePickerProps> = ({ images, setImages }) => {
  return (
    <div>
      <div className="flex gap-2 overflow-auto">
        {images.map((image, index) => (
          <Image
            src={URL.createObjectURL(image)}
            alt="image"
            key={image.name}
            width={150}
            height={150}
            className="h-24 w-24 rounded-xl border object-cover hover:opacity-80"
            onClick={() => {
              setImages((prev) => {
                const newImages = [...prev];
                newImages.splice(index, 1);
                return newImages;
              });
            }}
          />
        ))}
        <label
          className="flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center rounded-xl border object-cover"
          htmlFor="image-picker"
        >
          <Plus />
        </label>
        <input
          type="file"
          name="image-picker"
          id="image-picker"
          multiple
          className="hidden"
          onChange={(event) => {
            setImages((prev) => {
              if (event.target.files !== null) {
                return [...prev, ...event.target.files];
              }
              return prev;
            });
          }}
        />
      </div>
    </div>
  );
};

export default ImagePicker;
