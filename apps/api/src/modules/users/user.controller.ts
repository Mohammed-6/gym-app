import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as userService from "./user.service";

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await userService.listUsers();
  sendSuccess(res, 200, "Users fetched successfully", users);
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getUserById(req.params.id);
  sendSuccess(res, 200, "User fetched successfully", user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  sendSuccess(res, 201, "User created successfully", user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser(req.params.id, req.body);
  sendSuccess(res, 200, "User updated successfully", user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.deleteUser(req.params.id);
  sendSuccess(res, 200, "User deleted successfully", null);
});
