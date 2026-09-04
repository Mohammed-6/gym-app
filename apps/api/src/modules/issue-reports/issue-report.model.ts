import { Schema, model, Types } from "mongoose";
import { ISSUE_STATUSES, IssueStatus } from "@gym-app/shared";

export interface IssueReportDocument {
  _id: Types.ObjectId;
  id: number;
  title: string;
  description: string;
  project: string;
  repository: string;
  branch: string;
  issueStatus: IssueStatus;
  createdAt: Date;
  updatedAt: Date;
}

const issueReportSchema = new Schema<IssueReportDocument>(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    project: { type: String, required: true, trim: true },
    repository: { type: String, required: true, trim: true },
    branch: { type: String, required: true, trim: true },
    issueStatus: { type: String, enum: ISSUE_STATUSES, default: "pending" },
  },
  // "id: false" disables Mongoose's default `id` virtual (a string alias for _id),
  // which would otherwise collide with our own numeric `id` field.
  { timestamps: true, id: false }
);

export const IssueReport = model<IssueReportDocument>("IssueReport", issueReportSchema);
