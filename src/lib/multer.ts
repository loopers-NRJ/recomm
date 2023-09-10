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
  storage: multer.diskStorage({
    filename: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      if (!file.originalname.match(/\.(jpg|jpeg|webp|svg)$/)) {
        return cb(new Error("Only image files are allowed!"), fileName);
      }
      cb(null, fileName);
    },
  }),
});
