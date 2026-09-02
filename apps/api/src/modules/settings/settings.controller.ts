import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as settingsService from "./settings.service";

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.getSettings();
  sendSuccess(res, 200, "Settings fetched successfully", settings);
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await settingsService.updateSettings(req.body);
  sendSuccess(res, 200, "Settings updated successfully", settings);
});
