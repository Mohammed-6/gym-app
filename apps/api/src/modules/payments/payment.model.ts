import { Schema, model, Types } from "mongoose";
import { PAYMENT_METHODS, PAYMENT_PURPOSES, PaymentMethod, PaymentPurpose } from "@gym-app/shared";

export interface PaymentDocument {
  _id: Types.ObjectId;
  member: Types.ObjectId;
  membership: Types.ObjectId | null;
  branch: Types.ObjectId;
  purpose: PaymentPurpose;
  membershipAmount: number;
  otherFees: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  notes?: string;
  receivedBy: Types.ObjectId;
  receiptNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    membership: { type: Schema.Types.ObjectId, ref: "Membership", default: null },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    purpose: { type: String, enum: PAYMENT_PURPOSES, default: "membership" },
    membershipAmount: { type: Number, required: true, min: 0 },
    otherFees: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    dueAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentDate: { type: Date, required: true },
    notes: { type: String, trim: true },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiptNumber: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

paymentSchema.index({ branch: 1, paymentDate: -1 });
paymentSchema.index({ member: 1, paymentDate: -1 });

export const Payment = model<PaymentDocument>("Payment", paymentSchema);
