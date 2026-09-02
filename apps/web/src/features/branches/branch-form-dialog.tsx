"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
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
import { getApiErrorMessage } from "@/lib/api";
import { createBranch, updateBranch } from "./api";
import { Branch } from "./types";

const branchSchema = z.object({
  name: z.string().trim().min(1, "Branch name is required"),
  address: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

interface BranchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch?: Branch | null;
  onSaved: () => void;
}

export function BranchFormDialog({ open, onOpenChange, branch, onSaved }: BranchFormDialogProps) {
  const isEditing = Boolean(branch);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BranchFormValues>({ resolver: zodResolver(branchSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: branch?.name ?? "",
        address: branch?.address ?? "",
        phone: branch?.phone ?? "",
      });
    }
  }, [open, branch, reset]);

  async function onSubmit(values: BranchFormValues) {
    try {
      if (isEditing && branch) {
        await updateBranch(branch._id, values);
        toast.success("Branch updated successfully");
      } else {
        await createBranch(values);
        toast.success("Branch created successfully");
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save branch"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogCloseButton onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Branch" : "Add Branch"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Branch Name *</Label>
            <Input id="name" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Branch"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
