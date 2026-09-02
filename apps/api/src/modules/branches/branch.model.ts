import { Schema, model, Types } from "mongoose";

export interface BranchDocument {
  _id: Types.ObjectId;
  name: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  hasPhoto: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<BranchDocument>(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    phone: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    hasPhoto: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Branch = model<BranchDocument>("Branch", branchSchema);
