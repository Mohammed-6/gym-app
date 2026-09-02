import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "@gym-app/shared";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

interface AccessTokenPayload {
  id: string;
  role: UserRole;
  branchId: string | null;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;

  if (!token) {
    return next(ApiError.unauthorized("Authentication token missing"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as AccessTokenPayload;
    req.user = { id: payload.id, role: payload.role, branchId: payload.branchId };
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired token"));
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden("You do not have permission to perform this action"));
    }
    next();
  };
}
