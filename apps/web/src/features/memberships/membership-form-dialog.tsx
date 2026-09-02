"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api";
import { PhotoCaptureStage } from "@/components/camera/photo-capture-stage";
import { listMembershipPlans } from "@/features/membership-plans/api";
import { MembershipPlan } from "@/features/membership-plans/types";
import { createMembership } from "./api";

const membershipSchema = z.object({
  plan: z.string().min(1, "Select a plan"),
  discount: z.union([z.string().length(0), z.coerce.number().min(0)]),
  startDate: z.string().optional(),
});

type MembershipFormValues = z.infer<typeof membershipSchema>;

interface MembershipFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  mode: "add" | "renew";
  onSaved: () => void;
}

export function MembershipFormDialog({ open, onOpenChange, memberId, mode, onSaved }: MembershipFormDialogProps) {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MembershipFormValues>({
    resolver: zodResolver(membershipSchema),
    defaultValues: { plan: "", discount: "", startDate: "" },
  });

  useEffect(() => {
    if (!open) return;
    reset({ plan: "", discount: "", startDate: "" });
    setJustSaved(false);
    listMembershipPlans()
      .then((data) => setPlans(data.filter((plan) => plan.isActive)))
      .catch(() => toast.error("Could not load membership plans"));
  }, [open, reset]);

  const selectedPlanId = watch("plan");
  const discountValue = watch("discount");

  const selectedPlan = useMemo(() => plans.find((plan) => plan._id === selectedPlanId), [plans, selectedPlanId]);
  const discount = discountValue === "" || discountValue === undefined ? 0 : Number(discountValue);
  const finalAmount = selectedPlan ? Math.max(0, selectedPlan.price - discount) : 0;

  async function onSubmit(values: MembershipFormValues) {
    try {
      await createMembership({
        member: memberId,
        plan: values.plan,
        discount: values.discount === "" ? undefined : Number(values.discount),
        startDate: values.startDate || undefined,
      });
      toast.success(mode === "renew" ? "Membership renewed successfully" : "Membership added successfully");
      onSaved();
      // Last stage: offer a photo before closing, rather than closing immediately.
      setJustSaved(true);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save membership"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogCloseButton onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>
            {justSaved ? "One More Thing" : mode === "renew" ? "Renew Membership" : "Add Membership"}
          </DialogTitle>
          {!justSaved && (
            <DialogDescription>
              {mode === "renew"
                ? "The new membership will start after the current one ends, unless you set a start date."
                : "Assign a membership plan to this member."}
            </DialogDescription>
          )}
        </DialogHeader>

        {justSaved ? (
          <PhotoCaptureStage uploadUrl={`/members/${memberId}/photo`} onDone={() => onOpenChange(false)} />
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="plan">Plan *</Label>
            <Select id="plan" {...register("plan")}>
              <option value="">Select a plan</option>
              {plans.map((plan) => (
                <option key={plan._id} value={plan._id}>
                  {plan.name} &middot; {plan.durationInMonths} mo &middot; ₹{plan.price.toLocaleString("en-IN")}
                </option>
              ))}
            </Select>
            {errors.plan && <p className="mt-1 text-xs text-red-600">{errors.plan.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount">Discount (₹)</Label>
              <Input id="discount" type="number" min={0} step="0.01" {...register("discount")} />
              <p className="mt-1 text-xs text-slate-400">
                Only for a genuine price reduction — not a partial payment.
              </p>
            </div>
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input id="startDate" type="date" {...register("startDate")} />
              <p className="mt-1 text-xs text-slate-400">Leave blank to auto-calculate</p>
            </div>
          </div>

          {selectedPlan && (
            <div className="rounded-md bg-slate-50 p-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Plan Price</span>
                <span>₹{selectedPlan.price.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount</span>
                <span>- ₹{discount.toLocaleString("en-IN")}</span>
              </div>
              <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-medium text-slate-900">
                <span>Final Amount</span>
                <span>₹{finalAmount.toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Paying less than this today? Collect the partial payment next, and the rest tracks as due — it
                won&apos;t change this price.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Membership"}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
