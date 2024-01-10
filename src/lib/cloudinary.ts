import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { env } from "@/env";
import type { Image } from "@/utils/validation";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_KEY,
  api_secret: env.CLOUDINARY_SECRET,
  secure: true,
});

export const uploadToCloudinary = (fileArrayBuffer: ArrayBuffer) => {
  return new Promise<Image>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ resource_type: "image" }, (error, response) => {
        if (error ?? !response) {
          return reject(error);
        }
        const image: Image = {
          publicId: response.public_id,
          url: response.url,
          secureUrl: response.secure_url,
          originalFilename: response.original_filename,
          format: response.format,
          width: response.width,
          height: response.height,
          resource_type: response.resource_type,
        };
        return resolve(image);
      })
      .end(Buffer.from(fileArrayBuffer));
  });
};

export const deleteImage: (publicId: string) => Promise<void | Error> = async (
  publicId: string,
) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
    throw new Error("cannot delete the image");
  }
};

export default cloudinary;
