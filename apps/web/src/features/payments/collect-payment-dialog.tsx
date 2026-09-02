"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { PAYMENT_METHODS, PAYMENT_PURPOSES, PaymentPurpose } from "@gym-app/shared";
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
import { createPayment } from "./api";
import { paymentMethodLabels, paymentPurposeLabels } from "./labels";

const paymentSchema = z.object({
  purpose: z.enum(PAYMENT_PURPOSES),
  membershipAmount: z.coerce.number().min(0),
  otherFees: z.union([z.string().length(0), z.coerce.number().min(0)]),
  discount: z.union([z.string().length(0), z.coerce.number().min(0)]),
  paidAmount: z.coerce.number().min(0.01, "Paid amount must be greater than zero"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paymentDate: z.string().min(1, "Payment date is required"),
  notes: z.string().trim().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface CollectPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  membershipId?: string | null;
  defaultMembershipAmount?: number;
  initialPurpose?: PaymentPurpose;
  initialPaidAmount?: number;
  onSaved: () => void;
}

export function CollectPaymentDialog({
  open,
  onOpenChange,
  memberId,
  membershipId,
  defaultMembershipAmount,
  initialPurpose = "membership",
  initialPaidAmount,
  onSaved,
}: CollectPaymentDialogProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormValues>({ resolver: zodResolver(paymentSchema) });

  useEffect(() => {
    if (open) {
      const isDueSettlement = initialPurpose === "due_settlement";
      const membershipAmount = isDueSettlement ? 0 : (defaultMembershipAmount ?? 0);
      reset({
        purpose: initialPurpose,
        membershipAmount,
        otherFees: isDueSettlement && initialPaidAmount ? String(initialPaidAmount) : "",
        discount: "",
        paidAmount: initialPaidAmount ?? defaultMembershipAmount ?? 0,
        paymentMethod: "cash",
        paymentDate: new Date().toISOString().slice(0, 10),
        notes: "",
      });
    }
  }, [open, defaultMembershipAmount, initialPurpose, initialPaidAmount, reset]);

  const purpose = watch("purpose");
  const membershipAmount = Number(watch("membershipAmount")) || 0;
  const otherFeesValue = watch("otherFees");
  const discountValue = watch("discount");
  const paidAmountValue = watch("paidAmount");

  const otherFees = otherFeesValue === "" || otherFeesValue === undefined ? 0 : Number(otherFeesValue);
  const discount = discountValue === "" || discountValue === undefined ? 0 : Number(discountValue);
  const paidAmount = Number(paidAmountValue) || 0;
  const totalAmount = Math.max(0, membershipAmount + otherFees - discount);
  const dueAmount = Math.max(0, totalAmount - paidAmount);

  async function onSubmit(values: PaymentFormValues) {
    try {
      const result = await createPayment({
        member: memberId,
        membership: membershipId ?? null,
        purpose: values.purpose,
        membershipAmount: values.membershipAmount,
        otherFees: values.otherFees === "" ? undefined : Number(values.otherFees),
        discount: values.discount === "" ? undefined : Number(values.discount),
        paidAmount: values.paidAmount,
        paymentMethod: values.paymentMethod,
        paymentDate: values.paymentDate,
        notes: values.notes,
      });
      toast.success("Payment recorded successfully");
      onSaved();
      onOpenChange(false);
      router.push(`/receipts/${result.receipt._id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not record payment"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogCloseButton onClick={() => onOpenChange(false)} />
        <DialogHeader>
          <DialogTitle>Collect Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="purpose">Payment For *</Label>
            <Select id="purpose" {...register("purpose")}>
              {PAYMENT_PURPOSES.map((value) => (
                <option key={value} value={value}>
                  {paymentPurposeLabels[value]}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="membershipAmount">
                {purpose === "due_settlement" ? "Membership Fees (usually 0)" : "Membership Fees (₹)"}
              </Label>
              <Input id="membershipAmount" type="number" min={0} step="0.01" {...register("membershipAmount")} />
            </div>
            <div>
              <Label htmlFor="otherFees">{purpose === "due_settlement" ? "Amount Owed (₹)" : "Other Fees (₹)"}</Label>
              <Input id="otherFees" type="number" min={0} step="0.01" {...register("otherFees")} />
            </div>
            <div>
              <Label htmlFor="discount">Discount (₹)</Label>
              <Input id="discount" type="number" min={0} step="0.01" {...register("discount")} />
            </div>
            <div>
              <Label htmlFor="paidAmount">Paid Amount (₹) *</Label>
              <Input id="paidAmount" type="number" min={0} step="0.01" {...register("paidAmount")} />
              {errors.paidAmount && <p className="mt-1 text-xs text-red-600">{errors.paidAmount.message}</p>}
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method *</Label>
              <Select id="paymentMethod" {...register("paymentMethod")}>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {paymentMethodLabels[method]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input id="paymentDate" type="date" {...register("paymentDate")} />
              {errors.paymentDate && <p className="mt-1 text-xs text-red-600">{errors.paymentDate.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={2} {...register("notes")} />
          </div>

          <div className="rounded-md bg-slate-50 p-3 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Total Amount</span>
              <span>₹{totalAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Paid Amount</span>
              <span>₹{paidAmount.toLocaleString("en-IN")}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-medium text-slate-900">
              <span>Due Amount</span>
              <span className={dueAmount > 0 ? "text-red-600" : "text-emerald-600"}>
                ₹{dueAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Collect Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
