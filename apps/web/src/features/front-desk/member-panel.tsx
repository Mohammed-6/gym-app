"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CalendarCheck, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ViewPhotoButton } from "@/components/camera/view-photo-button";
import { useMember } from "@/features/members/use-member";
import { useMemberships } from "@/features/memberships/use-memberships";
import { useMemberPayments } from "@/features/payments/use-member-payments";
import { MembershipFormDialog } from "@/features/memberships/membership-form-dialog";
import { CollectPaymentDialog } from "@/features/payments/collect-payment-dialog";
import * as attendanceApi from "@/features/attendance/api";
import { Attendance } from "@/features/attendance/types";
import { getMembershipStatus, outstandingDue } from "./membership-status";
import { membershipStatusConfig } from "./status-config";

interface MemberPanelProps {
  memberId: string;
}

export function MemberPanel({ memberId }: MemberPanelProps) {
  const { member, isLoading: memberLoading } = useMember(memberId);
  const { memberships, refresh: refreshMemberships } = useMemberships(memberId);
  const { payments, refresh: refreshPayments } = useMemberPayments(memberId);

  const [membershipDialogOpen, setMembershipDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentDialogMode, setPaymentDialogMode] = useState<"membership" | "due_settlement">("membership");
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    let ignore = false;
    // Selecting a member at the front desk is itself the check-in event — do it automatically
    // so the receptionist doesn't need a second click for the common case.
    attendanceApi
      .checkIn(memberId)
      .then(({ attendance: record, isNew }) => {
        if (ignore) return;
        setAttendance(record);
        if (isNew) toast.success("Checked in");
      })
      .catch(() => {
        // attendance is a bonus feature; a failed check-in shouldn't block the front-desk flow
      });
    return () => {
      ignore = true;
    };
  }, [memberId]);

  const status = getMembershipStatus(memberships);
  const due = outstandingDue(payments);
  const hasAnyMembership = memberships.length > 0;
  const StatusIcon = membershipStatusConfig[status.kind].icon;

  async function handleCheckIn() {
    setCheckingIn(true);
    try {
      const { attendance: record, isNew } = await attendanceApi.checkIn(memberId);
      setAttendance(record);
      if (isNew) toast.success("Checked in");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not check in"));
    } finally {
      setCheckingIn(false);
    }
  }

  function openCollectPayment(mode: "membership" | "due_settlement") {
    setPaymentDialogMode(mode);
    setPaymentDialogOpen(true);
  }

  if (memberLoading) {
    return <p className="text-sm text-slate-500">Loading member...</p>;
  }

  if (!member) {
    return <p className="text-sm text-slate-500">Member not found.</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-slate-900">
                {member.firstName} {member.lastName}
              </h2>
              <Badge variant={member.status === "active" ? "success" : "neutral"}>
                {member.status === "active" ? "Active Member" : "Inactive"}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              {member.memberId} &middot; {member.phone} {member.batch && `· ${member.batch}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/members/${member._id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Full Profile
            </Link>
            <Link
              href={`/members/${member._id}/edit`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <ViewPhotoButton photoUrlEndpoint={`/members/${member._id}/photo-url`} hasPhoto={member.hasPhoto} />
          </div>
        </CardContent>
      </Card>

      <div className={cn("flex items-center gap-3 rounded-lg border p-4", membershipStatusConfig[status.kind].className)}>
        <StatusIcon className="h-5 w-5 shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{membershipStatusConfig[status.kind].label(status.days)}</p>
          {status.membership && (
            <p className="text-sm opacity-80">
              {typeof status.membership.plan === "string" ? status.membership.plan : status.membership.plan.name}
              {" · expires "}
              {new Date(status.membership.endDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <Button onClick={() => setMembershipDialogOpen(true)}>
          {hasAnyMembership ? "Renew Membership" : "Add Membership"}
        </Button>
      </div>

      {due > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium">Outstanding Due: ₹{due.toLocaleString("en-IN")}</p>
            <p className="text-sm opacity-80">From previous partial payments</p>
          </div>
          <Button variant="danger" onClick={() => openCollectPayment("due_settlement")}>
            Settle Due
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => openCollectPayment("membership")}>
          Collect Payment
        </Button>
        <Button
          variant={attendance ? "outline" : "secondary"}
          onClick={handleCheckIn}
          disabled={Boolean(attendance) || checkingIn}
        >
          <CalendarCheck className="h-4 w-4" />
          {attendance
            ? `Checked in at ${new Date(attendance.checkInAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : checkingIn
              ? "Checking in..."
              : "Check In"}
        </Button>
      </div>

      <MembershipFormDialog
        open={membershipDialogOpen}
        onOpenChange={setMembershipDialogOpen}
        memberId={memberId}
        mode={hasAnyMembership ? "renew" : "add"}
        onSaved={refreshMemberships}
      />

      <CollectPaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        memberId={memberId}
        membershipId={status.membership?._id}
        defaultMembershipAmount={paymentDialogMode === "membership" ? status.membership?.finalAmount : undefined}
        initialPurpose={paymentDialogMode}
        initialPaidAmount={paymentDialogMode === "due_settlement" ? due : undefined}
        onSaved={refreshPayments}
      />
    </div>
  );
}
