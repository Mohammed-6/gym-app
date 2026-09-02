import { Schema, model, Types } from "mongoose";

export interface AttendanceDocument {
  _id: Types.ObjectId;
  member: Types.ObjectId;
  branch: Types.ObjectId;
  checkInAt: Date;
  createdAt: Date;
}

const attendanceSchema = new Schema<AttendanceDocument>(
  {
    member: { type: Schema.Types.ObjectId, ref: "Member", required: true },
    branch: { type: Schema.Types.ObjectId, ref: "Branch", required: true },
    checkInAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

attendanceSchema.index({ member: 1, checkInAt: -1 });

export const Attendance = model<AttendanceDocument>("Attendance", attendanceSchema);
