import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { ApiError } from "../utils/ApiError";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    });
  }

  if (err instanceof MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "Photo is too large (max 8MB)" : err.message;
    return res.status(400).json({ success: false, message });
  }

  console.error("[unhandled error]", err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later.",
  });
}
