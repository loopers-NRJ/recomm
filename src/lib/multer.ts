import type { NextApiRequest } from "next/types";
import multer from "multer";

export interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
  buffer: Buffer;
}

export interface MulterRequest extends NextApiRequest {
  files: MulterFile[];
}

export const uploads = multer({
  // dest: "uploads/",
  storage: multer.diskStorage({
    // destination: function (req, file, cb) {
    //   cb(null, "uploads/");
    // },
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error("Only image files are allowed!"), fileName);
      }
      cb(null, fileName);
    },
  }),
});
