import { uploadToCloudinary } from "@/lib/cloudinary";
import { MaxImageCount } from "@/utils/constants";
import { type Image } from "@/utils/validation";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const files = form.getAll("files") as File[];
    if (files.length > MaxImageCount) {
      return new Response(`Cannot upload more than ${MaxImageCount} Images`, {
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
    return new Response(JSON.stringify(uploadToCloudinary));
  } catch (error) {
    console.log(error);
    return new Response("Something went wrong", { status: 500 });
  }
}
