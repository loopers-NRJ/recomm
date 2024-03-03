import { uploadToCloudinary } from "@/lib/cloudinary";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { MAXIMUM_IMAGE_COUNT } from "@/utils/constants";
import { getLogger } from "@/utils/logger";
import { type Image } from "@/utils/validation";

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }

  let files: File[];
  try {
    const form = await request.formData();
    files = form.getAll("images") as File[];
    if (files.length === 0) {
      return new Response("No images found", { status: 400 });
    }
    if (files.length > MAXIMUM_IMAGE_COUNT) {
      return new Response(
        `Cannot upload more than ${MAXIMUM_IMAGE_COUNT} Images`,
        {
          status: 400,
        },
      );
    }
  } catch (error) {
    return new Response("Invalid Request", { status: 400 });
  }

  const uploadedImages: Image[] = [];
  try {
    for (const file of files) {
      if (!(file instanceof File)) {
        return new Response("Invalid File", { status: 400 });
      }
      const image = await uploadToCloudinary(await file.arrayBuffer());
      uploadedImages.push(image);
    }
    return new Response(JSON.stringify(uploadedImages));
  } catch (error) {
    await getLogger(prisma).error({
      message: "Error uploading images",
      detail: JSON.stringify(error),
      state: "common",
    });
    return new Response("Something went wrong", { status: 500 });
  }
}
