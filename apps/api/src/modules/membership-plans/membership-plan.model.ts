import { Schema, model, Types } from "mongoose";

export interface MembershipPlanDocument {
  _id: Types.ObjectId;
  name: string;
  durationInMonths: number;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const membershipPlanSchema = new Schema<MembershipPlanDocument>(
  {
    name: { type: String, required: true, trim: true },
    durationInMonths: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const MembershipPlan = model<MembershipPlanDocument>("MembershipPlan", membershipPlanSchema);
