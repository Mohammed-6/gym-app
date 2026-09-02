import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import * as membershipPlanService from "./membership-plan.service";

export const getMembershipPlans = asyncHandler(async (_req: Request, res: Response) => {
  const plans = await membershipPlanService.listMembershipPlans();
  sendSuccess(res, 200, "Membership plans fetched successfully", plans);
});

export const getMembershipPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await membershipPlanService.getMembershipPlanById(req.params.id);
  sendSuccess(res, 200, "Membership plan fetched successfully", plan);
});

export const createMembershipPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await membershipPlanService.createMembershipPlan(req.body);
  sendSuccess(res, 201, "Membership plan created successfully", plan);
});

export const updateMembershipPlan = asyncHandler(async (req: Request, res: Response) => {
  const plan = await membershipPlanService.updateMembershipPlan(req.params.id, req.body);
  sendSuccess(res, 200, "Membership plan updated successfully", plan);
});

export const deleteMembershipPlan = asyncHandler(async (req: Request, res: Response) => {
  await membershipPlanService.deleteMembershipPlan(req.params.id);
  sendSuccess(res, 200, "Membership plan deleted successfully", null);
});
