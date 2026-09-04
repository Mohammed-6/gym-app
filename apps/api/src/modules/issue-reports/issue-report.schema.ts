import { z } from "zod";
import { ISSUE_STATUSES } from "@gym-app/shared";

export const createIssueReportSchema = z.object({
  id: z.coerce.number().int().positive("Id must be a positive number"),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  project: z.string().trim().min(1, "Project is required"),
  repository: z.string().trim().min(1, "Repository is required"),
  branch: z.string().trim().min(1, "Branch is required"),
  issueStatus: z.enum(ISSUE_STATUSES).optional(),
});

export const updateIssueReportSchema = createIssueReportSchema.partial();

export type CreateIssueReportInput = z.infer<typeof createIssueReportSchema>;
export type UpdateIssueReportInput = z.infer<typeof updateIssueReportSchema>;
