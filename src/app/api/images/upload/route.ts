import { uploadToCloudinary } from "@/lib/cloudinary";
import { getServerAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";
import { MAXIMUM_IMAGE_COUNT } from "@/utils/constants";
import { getLogger } from "@/utils/logger";
import { type Image } from "@/utils/validation";
import { type Session } from "next-auth";

export async function POST(request: Request) {
  let session: Session;
  const logger = getLogger(prisma);
  try {
    const authSession = await getServerAuthSession();
    if (!authSession) {
      return new Response("Unauthorized", { status: 401 });
    }
    session = authSession;
  } catch (error) {
    return new Response("Unauthorized", { status: 401 });
  }

  let files;
  try {
    const form = await request.formData();
    files = form.getAll("images");
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
  for (const file of files) {
    if (!(file instanceof File)) {
      return new Response("Invalid File", { status: 400 });
    }
    try {
      const image = await uploadToCloudinary(file, session.user.id);
      uploadedImages.push(image);
    } catch (error) {
      await logger.error({
        message: "Error uploading images",
        detail: JSON.stringify(error),
        city: "common",
      });
      return new Response("Something went wrong", { status: 500 });
    }
  }

  try {
    await prisma.image.createMany({
      data: uploadedImages,
    });
  } catch (error) {
    await logger.error({
      message: "Error uploading images",
      detail: JSON.stringify(error),
      city: "common",
    });
    return new Response("Something went wrong", { status: 500 });
  }
  return new Response(JSON.stringify(uploadedImages));
}
