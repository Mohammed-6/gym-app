import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { sendSuccess } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { resolveBranchFilter } from "../../utils/branchScope";
import { resolvePagination } from "../../utils/pagination";
import { getUserById } from "../users/user.service";
import { createReceiptForPayment } from "../receipts/receipt.service";
import * as paymentService from "./payment.service";

export const getPayments = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentService.listPayments({
    branchFilter: resolveBranchFilter(req),
    pagination: resolvePagination(req),
    member: typeof req.query.member === "string" ? req.query.member : undefined,
    paymentMethod: typeof req.query.paymentMethod === "string" ? req.query.paymentMethod : undefined,
    dateFrom: typeof req.query.dateFrom === "string" ? req.query.dateFrom : undefined,
    dateTo: typeof req.query.dateTo === "string" ? req.query.dateTo : undefined,
  });
  sendSuccess(res, 200, "Payments fetched successfully", result);
});

export const getPayment = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentService.getPaymentById(req.params.id, resolveBranchFilter(req));
  sendSuccess(res, 200, "Payment fetched successfully", payment);
});

export const createPayment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw ApiError.unauthorized();
  }

  const receivedByUser = await getUserById(req.user.id);
  const { payment, member } = await paymentService.createPayment(
    req.body,
    resolveBranchFilter(req),
    req.user.id
  );
  const receipt = await createReceiptForPayment(payment, member, receivedByUser.name);

  sendSuccess(res, 201, "Payment recorded successfully", { payment, receipt });
});
