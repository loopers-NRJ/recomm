import { z } from "zod";

import { deleteImage } from "@/lib/cloudinary";

import { adminWriteProcedure, createTRPCRouter } from "../trpc";

export const imageRouter = createTRPCRouter({
  deleteImage: adminWriteProcedure
    .input(z.object({ publicId: z.string() }))
    .mutation(({ input: { publicId } }) => {
      return deleteImage(publicId);
    }),
});
