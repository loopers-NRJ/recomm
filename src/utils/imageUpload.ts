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
      // for debugging purpose
      const contentType = result.headers.get("content-type");

      if (contentType === null) {
        console.log(contentType);
        return new Error("cannot upload the images.");
      }

      if (contentType.includes("application/json")) {
        const data = await result.json();
        console.log(data);
      } else if (
        contentType.includes("text/plain") ??
        contentType.includes("text/html")
      ) {
        console.log(await result.text());
        return new Error("cannot upload the images.");
      } else {
        console.log(contentType);
        return new Error("cannot upload the images.");
      }
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
