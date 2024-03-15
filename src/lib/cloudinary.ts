import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { env } from "@/env";
import type { Image } from "@/utils/validation";
import { getLogger } from "@/utils/logger";
import { prisma } from "@/server/db";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_KEY,
  api_secret: env.CLOUDINARY_SECRET,
  secure: true,
});

const fileToReadableStream = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const b64 = Buffer.from(arrayBuffer).toString("base64");
  const dataURI = "data:" + file.type + ";base64," + b64;
  return Readable.from(dataURI);
};

export const uploadToCloudinary = (file: File, userId: string) => {
  return new Promise<Image>((resolve, reject) => {
    try {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, response) => {
          if (error ?? !response) {
            return reject(error);
          }
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
        },
      );
      fileToReadableStream(file)
        .then((readableStream) => readableStream.pipe(uploadStream))
        .catch(reject);
    } catch (error) {
      return reject(error);
    }
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
      state: "common",
    });
    throw new Error("cannot delete the image");
  }
};

export default cloudinary;
