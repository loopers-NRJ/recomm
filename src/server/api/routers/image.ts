import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";

import { adminDeleteProcedure, createTRPCRouter } from "../trpc";

export const imageRouter = createTRPCRouter({
  deleteImage: adminDeleteProcedure
    .input(z.object({ publicId: z.string() }))
    .mutation(({ input: { publicId } }) => {
      return deleteImage(publicId);
    }),
});
