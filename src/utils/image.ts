import { z } from "zod";

import { imageInputs } from "./validation";

export const uploadImagesToBackend = async (images: File[]) => {
  const formData = new FormData();
  images.forEach((image) => {
    formData.append("images", image);
  });
  const uploadedPictureUrls = [];
  try {
    const result = await fetch("/api/images/upload", {
      method: "POST",
      body: formData,
    });

    if (!result.ok) {
      console.log(result);
      return new Error("cannot upload the images.");
    }
    const data = await result.json();
    const image = z.array(imageInputs).safeParse(data);
    if (image.success) {
      uploadedPictureUrls.push(...image.data);
      return uploadedPictureUrls;
    } else {
      console.log(data);
      return new Error("cannot upload the images.");
    }
  } catch (error) {
    console.log(error);
    return new Error("cannot upload the images.");
  }
};
