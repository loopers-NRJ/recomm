import { useState } from "react";
import { z } from "zod";

import { imageInputs } from "./validation";

const uploadImagesToBackend = async (images: File[]) => {
  const formData = new FormData();

  images.forEach((image) => {
    formData.append("images", image);
  });

  try {
    const result = await fetch("/api/images/upload", {
      method: "POST",
      body: formData,
    });

    if (!result.ok) {
      console.log(await result.text());
      return new Error("cannot upload the images.");
    }
    const data = await result.json();
    const image = z.array(imageInputs).safeParse(data);
    if (image.success) {
      return image.data;
    } else {
      console.log(data);
      return new Error("cannot upload the images.");
    }
  } catch (error) {
    console.log(error);
    return new Error("cannot upload the images.");
  }
};

export const useImageUploader = () => {
  const [isLoading, setLoading] = useState(false);
  return {
    isLoading,
    upload: async (images: File[]) => {
      setLoading(true);
      try {
        return await uploadImagesToBackend(images);
      } finally {
        setLoading(false);
      }
    },
  };
};
