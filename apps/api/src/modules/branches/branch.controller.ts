import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { sendSuccess } from "../../utils/ApiResponse";
import * as branchService from "./branch.service";

export const getBranches = asyncHandler(async (_req: Request, res: Response) => {
  const branches = await branchService.listBranches();
  sendSuccess(res, 200, "Branches fetched successfully", branches);
});

export const getBranch = asyncHandler(async (req: Request, res: Response) => {
  const branch = await branchService.getBranchById(req.params.id);
  sendSuccess(res, 200, "Branch fetched successfully", branch);
});

export const createBranch = asyncHandler(async (req: Request, res: Response) => {
  const branch = await branchService.createBranch(req.body);
  sendSuccess(res, 201, "Branch created successfully", branch);
});

export const updateBranch = asyncHandler(async (req: Request, res: Response) => {
  const branch = await branchService.updateBranch(req.params.id, req.body);
  sendSuccess(res, 200, "Branch updated successfully", branch);
});

export const deleteBranch = asyncHandler(async (req: Request, res: Response) => {
  await branchService.deleteBranch(req.params.id);
  sendSuccess(res, 200, "Branch deleted successfully", null);
});

export const uploadBranchPhoto = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest("No photo was uploaded");
  }
  await branchService.uploadBranchPhoto(req.params.id, req.file.buffer);
  sendSuccess(res, 200, "Photo uploaded successfully", { hasPhoto: true });
});

export const getBranchPhotoUrl = asyncHandler(async (req: Request, res: Response) => {
  const url = await branchService.getBranchPhotoUrl(req.params.id);
  sendSuccess(res, 200, "Photo url fetched successfully", { url });
});
