import { IssueStatus } from "@gym-app/shared";

export const issueStatusLabels: Record<IssueStatus, string> = {
  pending: "Pending",
  ai_resolve: "AI Resolve",
  git_push: "Git Push",
  approve: "Approve",
  rejected: "Rejected",
};

export const issueStatusBadgeVariant: Record<IssueStatus, "neutral" | "warning" | "success" | "danger"> = {
  pending: "neutral",
  ai_resolve: "warning",
  git_push: "warning",
  approve: "success",
  rejected: "danger",
};
