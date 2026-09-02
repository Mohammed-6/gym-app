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
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api";
import { createMembershipPlan, updateMembershipPlan } from "./api";
import { MembershipPlan } from "./types";

const planSchema = z.object({
  name: z.string().trim().min(1, "Plan name is required"),
  durationInMonths: z.coerce.number().int().min(1, "Duration must be at least 1 month"),
  price: z.coerce.number().min(0, "Price must be a positive number"),
  description: z.string().trim().optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: MembershipPlan | null;
  onSaved: () => void;
}

export function PlanFormDialog({ open, onOpenChange, plan, onSaved }: PlanFormDialogProps) {
  const isEditing = Boolean(plan);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlanFormValues>({ resolver: zodResolver(planSchema) });

  useEffect(() => {
    if (open) {
      reset({
        name: plan?.name ?? "",
        durationInMonths: plan?.durationInMonths ?? 1,
        price: plan?.price ?? 0,
        description: plan?.description ?? "",
      });
    }
  }, [open, plan, reset]);

  async function onSubmit(values: PlanFormValues) {
    try {
      if (isEditing && plan) {
        await updateMembershipPlan(plan._id, values);
        toast.success("Membership plan updated successfully");
      } else {
        await createMembershipPlan(values);
        toast.success("Membership plan created successfully");
      }
      onSaved();
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save membership plan"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogCloseButton onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Membership Plan" : "Add Membership Plan"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Plan Name *</Label>
            <Input id="name" placeholder="e.g. Quarterly" {...register("name")} />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="durationInMonths">Duration (months) *</Label>
              <Input id="durationInMonths" type="number" min={1} {...register("durationInMonths")} />
              {errors.durationInMonths && (
                <p className="mt-1 text-xs text-red-600">{errors.durationInMonths.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="price">Price (₹) *</Label>
              <Input id="price" type="number" min={0} step="0.01" {...register("price")} />
              {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
