import { Schema, model, Types } from "mongoose";
import { MEMBERSHIP_STATUSES, MembershipStatus } from "@gym-app/shared";

export interface MembershipDocument {
  _id: Types.ObjectId;
  member: Types.ObjectId;
  plan: Types.ObjectId;
  branch: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  price: number;
  discount: number;
  finalAmount: number;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

const membershipSchema = new Schema<MembershipDocument>(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    plan: { type: Schema.Types.ObjectId, ref: "MembershipPlan", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: MEMBERSHIP_STATUSES, default: "active" },
  },
  { timestamps: true }
);

membershipSchema.index({ member: 1, startDate: -1 });
membershipSchema.index({ branch: 1, status: 1, endDate: 1 });

export const Membership = model<MembershipDocument>("Membership", membershipSchema);
