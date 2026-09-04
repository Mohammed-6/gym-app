import { IssueStatus } from "@gym-app/shared";

export interface IssueReport {
  _id: string;
  id: number;
  title: string;
  description: string;
  project: string;
  repository: string;
  branch: string;
  issueStatus: IssueStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IssueReportInput {
  id: number;
  title: string;
  description: string;
  project: string;
  repository: string;
  branch: string;
  issueStatus?: IssueStatus;
}
