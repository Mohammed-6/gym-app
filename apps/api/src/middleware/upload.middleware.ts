import multer from "multer";
import { ApiError } from "../utils/ApiError";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export const uploadPhoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_PHOTO_BYTES },
  fileFilter(_req, file, callback) {
    if (!file.mimetype.startsWith("image/")) {
      callback(ApiError.badRequest("Only image files are allowed"));
      return;
    }
    callback(null, true);
  },
});
