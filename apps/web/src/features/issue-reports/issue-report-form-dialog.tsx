"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ISSUE_STATUSES } from "@gym-app/shared";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api";
import { createIssueReport, updateIssueReport } from "./api";
import { issueStatusLabels } from "./labels";
import { IssueReport } from "./types";

const issueReportFormSchema = z.object({
  id: z.coerce.number().int().positive("Id must be a positive number"),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  project: z.string().trim().min(1, "Project is required"),
  repository: z.string().trim().min(1, "Repository is required"),
  branch: z.string().trim().min(1, "Branch is required"),
  issueStatus: z.enum(ISSUE_STATUSES),
});

type IssueReportFormValues = z.infer<typeof issueReportFormSchema>;

interface IssueReportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueReport?: IssueReport | null;
  onSaved: () => void;
}

export function IssueReportFormDialog({ open, onOpenChange, issueReport, onSaved }: IssueReportFormDialogProps) {
  const isEditing = Boolean(issueReport);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IssueReportFormValues>({
    resolver: zodResolver(issueReportFormSchema),
  });

  useEffect(() => {
    if (!open) return;
    reset({
      id: issueReport?.id ?? ("" as unknown as number),
      title: issueReport?.title ?? "",
      description: issueReport?.description ?? "",
      project: issueReport?.project ?? "",
      repository: issueReport?.repository ?? "",
      branch: issueReport?.branch ?? "",
      issueStatus: issueReport?.issueStatus ?? "pending",
    });
  }, [open, issueReport, reset]);

  async function onSubmit(values: IssueReportFormValues) {
    try {
      if (isEditing && issueReport) {
        await updateIssueReport(issueReport._id, values);
        toast.success("Issue report updated successfully");
      } else {
        await createIssueReport(values);
        toast.success("Issue report created successfully");
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save issue report"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogCloseButton onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Issue Report" : "Add Issue Report"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="id">Id *</Label>
            <Input id="id" type="number" {...register("id")} />
            {errors.id && <p className="mt-1 text-xs text-red-600">{errors.id.message}</p>}
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" rows={4} {...register("description")} />
            {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project">Project *</Label>
              <Input id="project" {...register("project")} />
              {errors.project && <p className="mt-1 text-xs text-red-600">{errors.project.message}</p>}
            </div>
            <div>
              <Label htmlFor="repository">Repository *</Label>
              <Input id="repository" {...register("repository")} />
              {errors.repository && <p className="mt-1 text-xs text-red-600">{errors.repository.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="branch">Branch *</Label>
            <Input id="branch" {...register("branch")} />
            {errors.branch && <p className="mt-1 text-xs text-red-600">{errors.branch.message}</p>}
          </div>

          <div>
            <Label htmlFor="issueStatus">Status *</Label>
            <Select id="issueStatus" {...register("issueStatus")}>
              {ISSUE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {issueStatusLabels[status]}
                </option>
              ))}
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Issue Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
