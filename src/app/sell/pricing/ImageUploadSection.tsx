import { type ModelPayloadIncluded } from "@/types/prisma";
import ImagePicker from "../../../components/common/ImagePicker";
import { usePostingState } from "@/app/sell/PostingState";

interface ImageUploadSectionProps {
  model: ModelPayloadIncluded;
}

export default function ImageUploadSection({ model }: ImageUploadSectionProps) {
  const { images, setImages, formError } = usePostingState();
  return (
    <>
      <section>
        {/* additional questions */}
        <h2 className="my-4 text-xl font-bold">
          Upload your {model.name} images here
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
