"use client";

import { useEffect, useState } from "react";
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
import { getApiErrorMessage } from "@/lib/api";
import { PhotoCaptureStage } from "@/components/camera/photo-capture-stage";
import { createMember, getNextMemberId } from "./api";
import { Member } from "./types";

const quickAddSchema = z.object({
  memberId: z.string().trim().optional(),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().optional(),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  batch: z.string().trim().optional(),
});

type QuickAddValues = z.infer<typeof quickAddSchema>;

interface QuickAddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSearch?: string;
  onCreated: (member: Member) => void;
}

export function QuickAddMemberDialog({ open, onOpenChange, initialSearch, onCreated }: QuickAddMemberDialogProps) {
  const isPhoneLike = initialSearch ? /^\d{6,}$/.test(initialSearch) : false;
  const [createdMember, setCreatedMember] = useState<Member | null>(null);
  const [previewedMemberId, setPreviewedMemberId] = useState("");

  useEffect(() => {
    if (!open) return;
    getNextMemberId()
      .then(setPreviewedMemberId)
      .catch(() => {
        // Non-critical preview — the server still assigns a real id at creation time if left blank.
      });
  }, [open]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<QuickAddValues>({
    resolver: zodResolver(quickAddSchema),
    values: {
      memberId: previewedMemberId,
      firstName: "",
      lastName: "",
      phone: isPhoneLike ? (initialSearch ?? "") : "",
      batch: "",
    },
  });

  async function onSubmit(values: QuickAddValues) {
    try {
      const member = await createMember({
        ...values,
        // Only send a custom id if it was actually edited from the previewed default —
        // otherwise let the server assign the real one atomically.
        memberId: dirtyFields.memberId ? values.memberId : undefined,
        status: "active",
      });
      toast.success(`${member.memberId} created`);
      // Last stage before handing back to the caller: offer a quick photo.
      setCreatedMember(member);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create member"));
    }
  }

  function finish(member: Member) {
    onCreated(member);
    reset();
    setCreatedMember(null);
    onOpenChange(false);
  }

  // The member may already exist in the database (created, photo step skipped or dialog
  // closed early) — either way the caller still needs to know about it.
  function handleClose() {
    if (createdMember) {
      finish(createdMember);
    } else {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(next) : handleClose())}>
      <DialogContent>
        <DialogCloseButton onClick={handleClose} />
        <DialogHeader>
          <DialogTitle>{createdMember ? "One More Thing" : "Quick Add Member"}</DialogTitle>
          {!createdMember && (
            <DialogDescription>
              Just the essentials to get them in the door — add full details later from their profile.
            </DialogDescription>
          )}
        </DialogHeader>

        {createdMember ? (
          <PhotoCaptureStage
            uploadUrl={`/members/${createdMember._id}/photo`}
            onDone={() => finish(createdMember)}
          />
        ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="quick-memberId">Member ID</Label>
            <Input id="quick-memberId" className="font-mono" {...register("memberId")} />
            <p className="mt-1 text-xs text-slate-400">Auto-suggested — edit only if you need a specific ID.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quick-firstName">First Name *</Label>
              <Input id="quick-firstName" autoFocus {...register("firstName")} />
              {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <Label htmlFor="quick-lastName">Last Name</Label>
              <Input id="quick-lastName" {...register("lastName")} />
            </div>
          </div>

          <div>
            <Label htmlFor="quick-phone">Phone *</Label>
            <Input id="quick-phone" {...register("phone")} />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
          </div>

          <div>
            <Label htmlFor="quick-batch">Batch</Label>
            <Input id="quick-batch" placeholder="e.g. Morning 6-8 AM" {...register("batch")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create & Continue"}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
