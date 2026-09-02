import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import { resolveBranchFilter } from "../../utils/branchScope";
import * as dashboardService from "./dashboard.service";

export const getDashboard = asyncHandler(async (req: Request, res: Response) => {
  const summary = await dashboardService.getDashboardSummary({ branchFilter: resolveBranchFilter(req) });
  sendSuccess(res, 200, "Dashboard summary fetched successfully", summary);
});
