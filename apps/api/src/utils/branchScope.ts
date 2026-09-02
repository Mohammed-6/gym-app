import { Request } from "express";
import { Types } from "mongoose";
import { ApiError } from "./ApiError";

export function resolveBranchFilter(req: Request): { branch?: Types.ObjectId } {
  const queryBranch = typeof req.query.branch === "string" ? req.query.branch : undefined;

  if (req.user?.branchId) {
    return { branch: new Types.ObjectId(req.user.branchId) };
  }

  if (queryBranch) {
    return { branch: new Types.ObjectId(queryBranch) };
  }

  return {};
}

export function resolveBranchForCreate(req: Request, requestedBranch?: string | null): Types.ObjectId {
  if (req.user?.branchId) {
    return new Types.ObjectId(req.user.branchId);
  }
  if (requestedBranch) {
    return new Types.ObjectId(requestedBranch);
  }
  throw ApiError.badRequest("Branch is required");
}
