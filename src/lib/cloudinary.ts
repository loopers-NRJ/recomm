import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { env } from "@/env";
import type { Image } from "@/utils/validation";
import { getLogger } from "@/utils/logger";
import { prisma } from "@/server/db";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_KEY,
  api_secret: env.CLOUDINARY_SECRET,
  secure: true,
});

const fileToDataURI = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const b64 = Buffer.from(arrayBuffer).toString("base64");
  const dataURI = "data:" + file.type + ";base64," + b64;
  return dataURI;
};

export const uploadToCloudinary = (file: File, userId: string) => {
  return new Promise<Image>((resolve, reject) => {
    fileToDataURI(file)
      .then((dataURI) =>
        cloudinary.uploader.upload(dataURI).then((response) => {
          const image: Image = {
            publicId: response.public_id,
            url: response.url,
            secureUrl: response.secure_url,
            originalFilename: file.name,
            format: response.format,
            width: response.width,
            height: response.height,
            resource_type: response.resource_type,
            userId,
          };
          return resolve(image);
        }),
      )
      .catch(reject);
  });
};

export const deleteImage: (publicId: string) => Promise<void | Error> = async (
  publicId: string,
) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
    await getLogger(prisma).error({
      message: "Error deleting image",
      detail: JSON.stringify({ publicId, error }),
      city: "common",
    });
    throw new Error("cannot delete the image");
  }
};

export default cloudinary;
