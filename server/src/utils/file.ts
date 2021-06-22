import path from "path";
import { FileFilterCallback } from "multer";

export function validateFileType(
  req: Express.Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
): void {
  const filetypes = /jpeg|jpg|png|gz|json/;

  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return callback(null, true);
  }
  return callback(new Error(`Unsupported file type: ${file.mimetype}`));
}
