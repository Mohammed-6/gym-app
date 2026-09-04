import { api } from "@/lib/api";
import { IssueReport, IssueReportInput } from "./types";

export async function listIssueReports() {
  const { data } = await api.get<{ data: IssueReport[] }>("/issue-reports");
  return data.data;
}

export async function createIssueReport(input: IssueReportInput) {
  const { data } = await api.post<{ data: IssueReport }>("/issue-reports", input);
  return data.data;
}

export async function updateIssueReport(mongoId: string, input: Partial<IssueReportInput>) {
  const { data } = await api.patch<{ data: IssueReport }>(`/issue-reports/${mongoId}`, input);
  return data.data;
}

export async function deleteIssueReport(mongoId: string) {
  await api.delete(`/issue-reports/${mongoId}`);
}
