import { Schema, model, Types } from "mongoose";
import { GENDERS, Gender, MEMBER_STATUSES, MemberStatus } from "@gym-app/shared";

export interface MemberDocument {
  _id: Types.ObjectId;
  memberId: string;
  branch: Types.ObjectId;
  firstName: string;
  lastName?: string;
  fatherName?: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gender?: Gender;
  dateOfBirth?: Date;
  batch?: string;
  weight?: number;
  chest?: number;
  arm?: number;
  notes?: string;
  status: MemberStatus;
  hasPhoto: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const memberSchema = new Schema<MemberDocument>(
  {
    memberId: { type: String, required: true, unique: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    fatherName: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    gender: { type: String, enum: GENDERS },
    dateOfBirth: { type: Date },
    batch: { type: String, trim: true },
    weight: { type: Number, min: 0 },
    chest: { type: Number, min: 0 },
    arm: { type: Number, min: 0 },
    notes: { type: String, trim: true },
    status: { type: String, enum: MEMBER_STATUSES, default: "active" },
    hasPhoto: { type: Boolean, default: false },
  },
  { timestamps: true }
);

memberSchema.index({ branch: 1, status: 1 });
memberSchema.index({ phone: 1 });

export const Member = model<MemberDocument>("Member", memberSchema);
