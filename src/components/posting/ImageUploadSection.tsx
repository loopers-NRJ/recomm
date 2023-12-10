import { ModelPayloadIncluded } from "@/types/prisma";
import ImagePicker, { ImagePickerProps } from "../common/ImagePicker";

interface ImageUploadSectionProps extends ImagePickerProps {
  model: ModelPayloadIncluded;
}

export default function ImageUploadSection({
  model,
  ...props
}: ImageUploadSectionProps) {
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
            <ImagePicker {...props} />
          </div>
        </div>
      </section>
      <hr className="my-6" />
    </>
  );
}
