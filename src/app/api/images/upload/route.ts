import { uploadToCloudinary } from "@/lib/cloudinary";
import { getServerAuthSession } from "@/server/auth";
import { maxImageCount } from "@/utils/constants";
import { type Image } from "@/utils/validation";

export async function POST(request: Request) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const form = await request.formData();
    const files = form.getAll("images") as File[];
    if (files.length === 0) {
      return new Response("No images found", { status: 400 });
    }
    if (files.length > maxImageCount) {
      return new Response(`Cannot upload more than ${maxImageCount} Images`, {
        status: 400,
      });
    }

    const uploadedImages: Image[] = [];
    for (const file of files) {
      if (!(file instanceof File)) {
        return new Response("Invalid File", { status: 400 });
      }
      const image = await uploadToCloudinary(await file.arrayBuffer());
      uploadedImages.push(image);
    }
    return new Response(JSON.stringify(uploadedImages));
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
}
