import { v2 as cloudinary } from "cloudinary";

import { env } from "@/env.mjs";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_KEY,
  api_secret: env.CLOUDINARY_SECRET,
  secure: true,
});

export const uploadImage = async (localPath: string) => {
  try {
    const response = await cloudinary.uploader.upload(localPath);
    // imageInputs.parse(response)
    const image = {
      publicId: response.public_id,
      url: response.secure_url,
      width: response.width,
      height: response.height,
      fileType: response.format,
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
    return new Error("cannot delete the image");
  }
};

export default cloudinary;
