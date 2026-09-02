import { FilterQuery, Types } from "mongoose";
import { ApiError } from "../../utils/ApiError";
import { PaginationParams, buildPaginatedResult } from "../../utils/pagination";
import { MemberDocument } from "../members/member.model";
import { PaymentDocument } from "../payments/payment.model";
import { Receipt, ReceiptDocument } from "./receipt.model";

export async function createReceiptForPayment(payment: PaymentDocument, member: MemberDocument, receivedBy: string) {
  const addressParts = [member.address, member.city, member.state, member.pincode].filter(Boolean);

  return Receipt.create({
    receiptNumber: payment.receiptNumber,
    payment: payment._id,
    member: member._id,
    branch: payment.branch,
    purpose: payment.purpose,
    memberSnapshot: {
      memberId: member.memberId,
      name: [member.firstName, member.lastName].filter(Boolean).join(" "),
      fatherName: member.fatherName,
      phone: member.phone,
      address: addressParts.join(", "),
      batch: member.batch,
    },
    membershipFees: payment.membershipAmount,
    otherFees: payment.otherFees,
    discount: payment.discount,
    total: payment.totalAmount,
    paid: payment.paidAmount,
    due: payment.dueAmount,
    paymentMethod: payment.paymentMethod,
    paymentDate: payment.paymentDate,
    receivedBy,
  });
}

export interface ListReceiptsOptions {
  branchFilter: { branch?: Types.ObjectId };
  pagination: PaginationParams;
  search?: string;
}

export async function listReceipts(options: ListReceiptsOptions) {
  const { branchFilter, pagination, search } = options;
  const filter: FilterQuery<ReceiptDocument> = { ...branchFilter };

  if (search?.trim()) {
    const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ receiptNumber: regex }, { "memberSnapshot.name": regex }, { "memberSnapshot.memberId": regex }];
  }

  const [items, total] = await Promise.all([
    Receipt.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
    Receipt.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, pagination);
}

export async function getReceiptById(id: string, branchFilter: { branch?: Types.ObjectId }) {
  const receipt = await Receipt.findOne({ _id: id, ...branchFilter }).populate("branch", "name address phone");
  if (!receipt) {
    throw ApiError.notFound("Receipt not found");
  }
  return receipt;
}

export async function getReceiptByPaymentId(paymentId: string, branchFilter: { branch?: Types.ObjectId }) {
  const receipt = await Receipt.findOne({ payment: paymentId, ...branchFilter }).populate(
    "branch",
    "name address phone"
  );
  if (!receipt) {
    throw ApiError.notFound("Receipt not found");
  }
  return receipt;
}
