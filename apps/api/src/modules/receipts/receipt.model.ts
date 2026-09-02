import { Schema, model, Types } from "mongoose";
import { PAYMENT_METHODS, PAYMENT_PURPOSES, PaymentMethod, PaymentPurpose } from "@gym-app/shared";

export interface ReceiptDocument {
  _id: Types.ObjectId;
  receiptNumber: string;
  payment: Types.ObjectId;
  member: Types.ObjectId;
  branch: Types.ObjectId;
  purpose: PaymentPurpose;
  memberSnapshot: {
    memberId: string;
    name: string;
    fatherName?: string;
    phone: string;
    address?: string;
    batch?: string;
  };
  membershipFees: number;
  otherFees: number;
  discount: number;
  total: number;
  paid: number;
  due: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  receivedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const receiptSchema = new Schema<ReceiptDocument>(
  {
    receiptNumber: { type: String, required: true, unique: true },
    payment: { type: Schema.Types.ObjectId, ref: "Payment", required: true, unique: true },
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    purpose: { type: String, enum: PAYMENT_PURPOSES, default: "membership" },
    memberSnapshot: {
      memberId: { type: String, required: true },
      name: { type: String, required: true },
      fatherName: { type: String },
      phone: { type: String, required: true },
      address: { type: String },
      batch: { type: String },
    },
    membershipFees: { type: Number, required: true, min: 0 },
    otherFees: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paid: { type: Number, required: true, min: 0 },
    due: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentDate: { type: Date, required: true },
    receivedBy: { type: String, required: true },
  },
  { timestamps: true }
);

receiptSchema.index({ branch: 1, createdAt: -1 });

export const Receipt = model<ReceiptDocument>("Receipt", receiptSchema);
