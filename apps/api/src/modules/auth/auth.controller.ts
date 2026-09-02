import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { getUserById } from "../users/user.service";
import * as authService from "./auth.service";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  sendSuccess(res, 200, "Logged in successfully", result);
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }
  const user = await getUserById(req.user.id);
  sendSuccess(res, 200, "Current user fetched successfully", user);
});
