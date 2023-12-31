import { type ModelPayloadIncluded } from "@/types/prisma";
import ImagePicker, { type ImagePickerProps } from "../common/ImagePicker";
import { type ProductFormError } from "@/utils/validation";

interface ImageUploadSectionProps extends ImagePickerProps {
  model: ModelPayloadIncluded;
  formError: ProductFormError;
}

export default function ImageUploadSection({
  model,
  formError,
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
            <ImagePicker {...props} requiredError={!!formError.images} />
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
