import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import { resolveBranchFilter } from "../../utils/branchScope";
import { resolvePagination } from "../../utils/pagination";
import * as membershipService from "./membership.service";

export const getMemberships = asyncHandler(async (req: Request, res: Response) => {
  const result = await membershipService.listMemberships({
    branchFilter: resolveBranchFilter(req),
    pagination: resolvePagination(req, 50),
    member: typeof req.query.member === "string" ? req.query.member : undefined,
    status: typeof req.query.status === "string" ? req.query.status : undefined,
  });
  sendSuccess(res, 200, "Memberships fetched successfully", result);
});

export const getMembership = asyncHandler(async (req: Request, res: Response) => {
  const membership = await membershipService.getMembershipById(req.params.id, resolveBranchFilter(req));
  sendSuccess(res, 200, "Membership fetched successfully", membership);
});

export const createMembership = asyncHandler(async (req: Request, res: Response) => {
  const membership = await membershipService.createMembership(req.body, resolveBranchFilter(req));
  sendSuccess(res, 201, "Membership created successfully", membership);
});

export const updateMembership = asyncHandler(async (req: Request, res: Response) => {
  const membership = await membershipService.updateMembershipStatus(
    req.params.id,
    req.body,
    resolveBranchFilter(req)
  );
  sendSuccess(res, 200, "Membership updated successfully", membership);
});

export const deleteMembership = asyncHandler(async (req: Request, res: Response) => {
  await membershipService.deleteMembership(req.params.id, resolveBranchFilter(req));
  sendSuccess(res, 200, "Membership deleted successfully", null);
});
