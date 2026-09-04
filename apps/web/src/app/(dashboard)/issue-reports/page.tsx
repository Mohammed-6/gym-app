"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api";
import { deleteIssueReport, listIssueReports } from "@/features/issue-reports/api";
import { IssueReportFormDialog } from "@/features/issue-reports/issue-report-form-dialog";
import { issueStatusBadgeVariant, issueStatusLabels } from "@/features/issue-reports/labels";
import { IssueReport } from "@/features/issue-reports/types";

export default function IssueReportsPage() {
  const [issueReports, setIssueReports] = useState<IssueReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<IssueReport | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() {
    setRefreshKey((key) => key + 1);
  }

  useEffect(() => {
    let ignore = false;

    listIssueReports()
      .then((data) => {
        if (!ignore) setIssueReports(data);
      })
      .catch((error) => {
        if (!ignore) toast.error(getApiErrorMessage(error, "Could not load issue reports"));
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [refreshKey]);

  function openAddDialog() {
    setEditingReport(null);
    setDialogOpen(true);
  }

  function openEditDialog(report: IssueReport) {
    setEditingReport(report);
    setDialogOpen(true);
  }

  async function handleDelete(report: IssueReport) {
    if (!window.confirm(`Delete issue report "${report.title}"? This cannot be undone.`)) return;
    try {
      await deleteIssueReport(report._id);
      toast.success("Issue report deleted successfully");
      refresh();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete issue report"));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Issue Reports</h1>
          <p className="mt-1 text-sm text-slate-500">Track reported bugs across projects and repositories.</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4" />
          Add Issue Report
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Id</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Repository</TableHead>
            <TableHead>Branch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-16 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-400">
                Loading...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && issueReports.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-slate-400">
                No issue reports yet. Add the first one.
              </TableCell>
            </TableRow>
          )}
          {issueReports.map((report) => (
            <TableRow key={report._id}>
              <TableCell className="font-mono text-slate-500">{report.id}</TableCell>
              <TableCell className="font-medium text-slate-900">{report.title}</TableCell>
              <TableCell>{report.project}</TableCell>
              <TableCell>{report.repository}</TableCell>
              <TableCell className="font-mono">{report.branch}</TableCell>
              <TableCell>
                <Badge variant={issueStatusBadgeVariant[report.issueStatus]}>
                  {issueStatusLabels[report.issueStatus]}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuItem onClick={() => openEditDialog(report)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem danger onClick={() => handleDelete(report)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <IssueReportFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        issueReport={editingReport}
        onSaved={refresh}
      />
    </div>
  );
}
