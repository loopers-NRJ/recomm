import fs from "fs";
import { NextApiResponse } from "next";

import { uploadImage } from "@/lib/cloudinary";
import { MulterRequest, uploads } from "@/lib/multer";
import { Image } from "@/utils/validation";

const MAX_IMAGE_COUNT = 10;

const handler = (request: MulterRequest, response: NextApiResponse) => {
  if (request.method === "POST") {
    return POST(request, response);
  } else {
    return response.status(405).end(`Method ${request.method} Not Allowed`);
  }
};

const POST = (request: MulterRequest, response: NextApiResponse) => {
  const middleware = uploads.array("images", MAX_IMAGE_COUNT);
  try {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    return middleware(request as never, response as never, async (error) => {
      if (error) {
        // cannot upload images to local storage
        console.error("cannot upload images to local storage", error);
        return response.status(500).json({ error: "cannot upload images" });
      }

      const images: Image[] = [];
      // uploading images to cloudinary
      for (const file of request.files) {
        try {
          const picture = await uploadImage(file.path);
          if (picture instanceof Error) {
            console.error("cannot upload images to cloudinary", picture);
            return response.status(500).json({ error: "cannot upload images" });
          }
          images.push(picture);
        } catch (error) {
          console.error("cannot upload images to cloudinary", error);
          return response.status(500).json({ error: "cannot upload images" });
        }
      }

      // remove files from local storage
      request.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });

      return response.status(200).json(images);
    });
  } catch (error) {
    return response.status(500).json({ message: "third error", error });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
export default handler;
