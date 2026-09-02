import { FilterQuery, Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { PaginationParams, buildPaginatedResult } from "../../utils/pagination";
import { startOfDay } from "../../utils/dates";
import { Member } from "../members/member.model";
import { Membership } from "../memberships/membership.model";
import { formatSequence, getNextSequenceValue } from "../sequences/sequence.service";
import { calculatePaymentTotals } from "./payment.calculations";
import { Payment, PaymentDocument } from "./payment.model";
import { CreatePaymentInput } from "./payment.schema";

export interface ListPaymentsOptions {
  branchFilter: { branch?: Types.ObjectId };
  pagination: PaginationParams;
  member?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function listPayments(options: ListPaymentsOptions) {
  const { branchFilter, pagination, member, paymentMethod, dateFrom, dateTo } = options;
  const filter: FilterQuery<PaymentDocument> = { ...branchFilter };

  if (member) {
    filter.member = new Types.ObjectId(member);
  }
  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }
  if (dateFrom || dateTo) {
    filter.paymentDate = {};
    if (dateFrom) filter.paymentDate.$gte = startOfDay(new Date(dateFrom));
    if (dateTo) filter.paymentDate.$lte = new Date(dateTo);
  }

  const [items, total] = await Promise.all([
    Payment.find(filter)
      .populate("member", "memberId firstName lastName phone")
      .populate("receivedBy", "name")
      .sort({ paymentDate: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),
    Payment.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, pagination);
}

export async function getPaymentById(id: string, branchFilter: { branch?: Types.ObjectId }) {
  const payment = await Payment.findOne({ _id: id, ...branchFilter })
    .populate("member", "memberId firstName lastName phone")
    .populate("receivedBy", "name");
  if (!payment) {
    throw ApiError.notFound("Payment not found");
  }
  return payment;
}

export async function createPayment(
  input: CreatePaymentInput,
  branchFilter: { branch?: Types.ObjectId },
  receivedBy: string
) {
  const member = await Member.findOne({ _id: input.member, ...branchFilter });
  if (!member) {
    throw ApiError.notFound("Member not found");
  }

  if (input.membership) {
    const membership = await Membership.findOne({ _id: input.membership, member: member._id });
    if (!membership) {
      throw ApiError.badRequest("Membership does not belong to this member");
    }
  }

  const totals = calculatePaymentTotals(input);

  const sequenceValue = await getNextSequenceValue("receipt");
  const receiptNumber = formatSequence("RCP", sequenceValue);

  const payment = await Payment.create({
    member: member._id,
    membership: input.membership ?? null,
    branch: member.branch,
    purpose: input.purpose ?? "membership",
    membershipAmount: input.membershipAmount,
    otherFees: totals.otherFees,
    discount: totals.discount,
    totalAmount: totals.totalAmount,
    paidAmount: totals.paidAmount,
    dueAmount: totals.dueAmount,
    paymentMethod: input.paymentMethod,
    paymentDate: input.paymentDate ?? new Date(),
    notes: input.notes,
    receivedBy,
    receiptNumber,
  });

  return { payment, member };
}
