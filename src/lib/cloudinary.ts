import { v2 as cloudinary } from "cloudinary";

import { env } from "@/env.mjs";
import { Image } from "@/utils/validation";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_KEY,
  api_secret: env.CLOUDINARY_SECRET,
  secure: true,
});

export const uploadImage = async (localPath: string) => {
  try {
    const response = await cloudinary.uploader.upload(localPath);
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
    return image;
  } catch (error) {
    console.log(error);
    return new Error("cannot upload the image");
  }
};

export const deleteImage: (publicId: string) => Promise<void | Error> = async (
  publicId: string
) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
    throw new Error("cannot delete the image");
  }
};

export default cloudinary;
