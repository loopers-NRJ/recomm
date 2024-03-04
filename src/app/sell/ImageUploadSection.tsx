import ImagePicker from "../../components/common/ImagePicker";
import { usePostingState } from "@/app/sell/PostingState";

interface ImageUploadSectionProps {
  modelName: string;
}

export default function ImageUploadSection({
  modelName,
}: ImageUploadSectionProps) {
  const { images, setImages, formError } = usePostingState();
  return (
    <>
      <section>
        {/* additional questions */}
        <h2 className="my-4 text-xl font-bold">
          Upload your {modelName} images here
        </h2>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            Click the plus button to upload your images
            <ImagePicker
              images={images}
              setImages={(files) => {
                if (files instanceof Function) {
                  setImages(files(images));
                } else {
                  setImages(files);
                }
              }}
              maxImages={10}
              requiredError={!!formError.images}
            />
            {formError.images && (
              <p className="text-red-500">{formError.images.message}</p>
            )}
          </div>
        </div>
      </section>
      <hr className="my-6" />
    </>
  );
}
