import { NextFunction, Request, Response } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

function flattenZodError(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "_";
    fieldErrors[path] = [...(fieldErrors[path] ?? []), issue.message];
  }
  return fieldErrors;
}

export function validateBody(schema: AnyZodObject) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(ApiError.badRequest("Validation failed", flattenZodError(result.error)));
    }
    req.body = result.data;
    next();
  };
}
