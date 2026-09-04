import { IssueStatus } from "@gym-app/shared";
import { ApiError } from "../../utils/ApiError";
import { IssueReport } from "./issue-report.model";
import { CreateIssueReportInput, UpdateIssueReportInput } from "./issue-report.schema";

export async function listIssueReports() {
  return IssueReport.find().sort({ createdAt: -1 });
}

export async function listIssueReportsByStatus(status?: IssueStatus) {
  const filter = status ? { issueStatus: status } : {};
  return IssueReport.find(filter).sort({ createdAt: -1 });
}

export async function getIssueReportById(mongoId: string) {
  const report = await IssueReport.findById(mongoId);
  if (!report) {
    throw ApiError.notFound("Issue report not found");
  }
  return report;
}

export async function createIssueReport(input: CreateIssueReportInput) {
  const existing = await IssueReport.findOne({ id: input.id });
  if (existing) {
    throw ApiError.conflict(`An issue report with id ${input.id} already exists`);
  }
  return IssueReport.create(input);
}

export async function updateIssueReport(mongoId: string, input: UpdateIssueReportInput) {
  if (input.id !== undefined) {
    const existing = await IssueReport.findOne({ id: input.id, _id: { $ne: mongoId } });
    if (existing) {
      throw ApiError.conflict(`An issue report with id ${input.id} already exists`);
    }
  }

  const report = await IssueReport.findByIdAndUpdate(mongoId, input, { new: true, runValidators: true });
  if (!report) {
    throw ApiError.notFound("Issue report not found");
  }
  return report;
}

export async function deleteIssueReport(mongoId: string) {
  const report = await IssueReport.findByIdAndDelete(mongoId);
  if (!report) {
    throw ApiError.notFound("Issue report not found");
  }
}
