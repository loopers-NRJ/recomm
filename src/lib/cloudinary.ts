import { env } from "@/env.mjs";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_KEY,
  api_secret: env.CLOUDINARY_SECRET,
  secure: true,
});

export const uploadImages: (file: string) => Promise<string | Error> = async (
  file: string
) => {
  return new Promise((resolve, reject) => {
    void cloudinary.uploader.upload(file, (err, res) => {
      if (err !== undefined || res === undefined) {
        return reject(new Error("Upload failed"));
      }
      resolve(res.secure_url);
    });
  });
};

export default cloudinary;
