export interface ImportRowResult {
  row: number;
  success: boolean;
  memberId?: string;
  error?: string;
}

export interface ImportMembersResult {
  results: ImportRowResult[];
  importedCount: number;
  failedCount: number;
}
