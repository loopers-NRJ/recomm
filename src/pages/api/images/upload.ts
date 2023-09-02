import { type MulterRequest, uploads } from "@/lib/multer";
import { type NextApiResponse } from "next";
import { uploadImages } from "@/lib/cloudinary";
import fs from "fs";
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
        console.log(error, "this is the first one");
        // cannot upload images to local storage
        return response.status(500).json({ message: "First Error", error });
      }

      const pictureUrls = [];
      // uploading images to cloudinary
      for (const file of request.files) {
        try {
          const picture = await uploadImages(file.path);
          pictureUrls.push(picture);
        } catch (error) {
          console.log(error, "this is the first one");
          return response.status(500).json({ message: "second error", error });
        }
      }

      // remove files from local storage
      request.files.forEach((file) => {
        fs.unlinkSync(file.path);
      });

      return response.status(200).json(pictureUrls);
    });
  } catch (error) {
    console.log(error, "this is the second one");
    return response.status(500).json({ message: "third error", error });
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
export default handler;
