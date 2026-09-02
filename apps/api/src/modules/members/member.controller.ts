import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/ApiError";
import { sendSuccess } from "../../utils/ApiResponse";
import { resolveBranchFilter, resolveBranchForCreate } from "../../utils/branchScope";
import { resolvePagination } from "../../utils/pagination";
import * as memberService from "./member.service";

export const getMembers = asyncHandler(async (req: Request, res: Response) => {
  const result = await memberService.listMembers({
    branchFilter: resolveBranchFilter(req),
    pagination: resolvePagination(req),
    search: typeof req.query.search === "string" ? req.query.search : undefined,
    status: typeof req.query.status === "string" ? req.query.status : undefined,
    sortBy: typeof req.query.sortBy === "string" ? req.query.sortBy : undefined,
    sortOrder: typeof req.query.sortOrder === "string" ? req.query.sortOrder : undefined,
  });
  sendSuccess(res, 200, "Members fetched successfully", result);
});

export const getNextMemberId = asyncHandler(async (_req: Request, res: Response) => {
  const nextMemberId = await memberService.previewNextMemberId();
  sendSuccess(res, 200, "Next member id fetched successfully", { nextMemberId });
});

export const getMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await memberService.getMemberById(req.params.id, resolveBranchFilter(req));
  sendSuccess(res, 200, "Member fetched successfully", member);
});

export const createMember = asyncHandler(async (req: Request, res: Response) => {
  const branch = resolveBranchForCreate(req, req.body.branch);
  const member = await memberService.createMember(req.body, branch);
  sendSuccess(res, 201, "Member created successfully", member);
});

export const importMembers = asyncHandler(async (req: Request, res: Response) => {
  const branch = resolveBranchForCreate(req, req.body.branch);
  const result = await memberService.bulkImportMembers(req.body.members, branch);
  sendSuccess(
    res,
    200,
    `Imported ${result.importedCount} of ${result.results.length} member${result.results.length === 1 ? "" : "s"}`,
    result
  );
});

export const uploadMemberPhoto = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest("No photo was uploaded");
  }
  await memberService.uploadMemberPhoto(req.params.id, req.file.buffer, resolveBranchFilter(req));
  sendSuccess(res, 200, "Photo uploaded successfully", { hasPhoto: true });
});

export const getMemberPhotoUrl = asyncHandler(async (req: Request, res: Response) => {
  const url = await memberService.getMemberPhotoUrl(req.params.id, resolveBranchFilter(req));
  sendSuccess(res, 200, "Photo url fetched successfully", { url });
});

export const updateMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await memberService.updateMember(req.params.id, req.body, resolveBranchFilter(req));
  sendSuccess(res, 200, "Member updated successfully", member);
});

export const deleteMember = asyncHandler(async (req: Request, res: Response) => {
  await memberService.deleteMember(req.params.id, resolveBranchFilter(req));
  sendSuccess(res, 200, "Member deleted successfully", null);
});
