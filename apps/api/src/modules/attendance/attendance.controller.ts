import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import { resolveBranchFilter } from "../../utils/branchScope";
import * as attendanceService from "./attendance.service";

export const getTodayAttendance = asyncHandler(async (req: Request, res: Response) => {
  const attendance = await attendanceService.getTodayAttendance(req.params.memberId, resolveBranchFilter(req));
  sendSuccess(res, 200, "Attendance fetched successfully", attendance);
});

export const checkIn = asyncHandler(async (req: Request, res: Response) => {
  const result = await attendanceService.checkIn(req.body.member, resolveBranchFilter(req));
  sendSuccess(res, 201, "Checked in successfully", result);
});
