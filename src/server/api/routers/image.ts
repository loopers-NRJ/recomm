import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";

import { adminProcedure, createTRPCRouter } from "../trpc";

export const imageRouter = createTRPCRouter({
  deleteImage: adminProcedure
    .input(z.object({ publicId: z.string() }))
    .mutation(({ input: { publicId } }) => {
      return deleteImage(publicId);
    }),
});
