import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import { resolveBranchFilter } from "../../utils/branchScope";
import { resolvePagination } from "../../utils/pagination";
import * as receiptService from "./receipt.service";

export const getReceipts = asyncHandler(async (req: Request, res: Response) => {
  const result = await receiptService.listReceipts({
    branchFilter: resolveBranchFilter(req),
    pagination: resolvePagination(req),
    search: typeof req.query.search === "string" ? req.query.search : undefined,
  });
  sendSuccess(res, 200, "Receipts fetched successfully", result);
});

export const getReceipt = asyncHandler(async (req: Request, res: Response) => {
  const receipt = await receiptService.getReceiptById(req.params.id, resolveBranchFilter(req));
  sendSuccess(res, 200, "Receipt fetched successfully", receipt);
});

export const getReceiptByPayment = asyncHandler(async (req: Request, res: Response) => {
  const receipt = await receiptService.getReceiptByPaymentId(req.params.paymentId, resolveBranchFilter(req));
  sendSuccess(res, 200, "Receipt fetched successfully", receipt);
});
