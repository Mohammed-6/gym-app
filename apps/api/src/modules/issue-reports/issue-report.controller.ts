import { Request, Response } from "express";
import { ISSUE_STATUSES, IssueStatus } from "@gym-app/shared";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { sendSuccess } from "../../utils/ApiResponse";
import * as issueReportService from "./issue-report.service";

export const getIssueReports = asyncHandler(async (_req: Request, res: Response) => {
  const reports = await issueReportService.listIssueReports();
  sendSuccess(res, 200, "Issue reports fetched successfully", reports);
});

// Public — no auth — lets external tooling poll issue reports by status.
export const getPublicIssueReports = asyncHandler(async (req: Request, res: Response) => {
  const status = typeof req.query.status === "string" ? req.query.status : undefined;
  if (status && !ISSUE_STATUSES.includes(status as IssueStatus)) {
    throw ApiError.badRequest(`Invalid status. Must be one of: ${ISSUE_STATUSES.join(", ")}`);
  }
  const reports = await issueReportService.listIssueReportsByStatus(status as IssueStatus | undefined);
  sendSuccess(res, 200, "Issue reports fetched successfully", reports);
});

export const getIssueReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await issueReportService.getIssueReportById(req.params.id);
  sendSuccess(res, 200, "Issue report fetched successfully", report);
});

export const createIssueReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await issueReportService.createIssueReport(req.body);
  sendSuccess(res, 201, "Issue report created successfully", report);
});

export const updateIssueReport = asyncHandler(async (req: Request, res: Response) => {
  const report = await issueReportService.updateIssueReport(req.params.id, req.body);
  sendSuccess(res, 200, "Issue report updated successfully", report);
});

export const deleteIssueReport = asyncHandler(async (req: Request, res: Response) => {
  await issueReportService.deleteIssueReport(req.params.id);
  sendSuccess(res, 200, "Issue report deleted successfully", null);
});
